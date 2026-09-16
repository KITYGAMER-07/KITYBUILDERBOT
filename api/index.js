import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { RichMessageService } from './richMessageService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Vercel functions receive uploads in memory. Keep the combined payload below
// the platform request limit while preserving direct-to-Telegram file uploads.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_SUPABASE_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 10,
    fieldSize: 512 * 1024
  }
});

const parseMediaUploads = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (!err) return next();
    const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
      ? 'Each upload must be 4 MB or smaller on this Vercel deployment.'
      : err.message || 'Unable to process the uploaded media.';
    return res.status(400).json({ success: false, error: message });
  });
};

const sanitizeFileName = (value = '') => {
  const cleaned = String(value)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(-100);
  return cleaned || 'media.bin';
};

const isSupportedMediaType = (contentType = '') => (
  /^(image|video|audio)\/[a-z0-9.+-]+$/i.test(contentType)
);

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_BUCKET?.trim() || 'rich-media';

  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey, bucket };
};

const verifyTelegramInitData = (initData) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !initData || typeof initData !== 'string') return null;

  const params = new URLSearchParams(initData);
  const receivedHash = params.get('hash');
  const authDate = Number(params.get('auth_date'));
  if (!receivedHash || !Number.isFinite(authDate)) return null;

  const currentSeconds = Math.floor(Date.now() / 1000);
  if (authDate > currentSeconds + 60 || currentSeconds - authDate > MAX_INIT_DATA_AGE_SECONDS) {
    return null;
  }

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  const receivedBuffer = Buffer.from(receivedHash, 'utf8');
  const expectedBuffer = Buffer.from(expectedHash, 'utf8');

  if (receivedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const user = JSON.parse(params.get('user') || '{}');
    return user?.id ? user : null;
  } catch {
    return null;
  }
};

// Cached bot info to reduce redundant getMe calls
let cachedBotInfo = null;

async function getBotInfo(token) {
  if (cachedBotInfo) return cachedBotInfo;
  const botToken = token || process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;
  try {
    const res = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`, { timeout: 10000 });
    if (res.data?.ok) {
      cachedBotInfo = res.data.result;
      return cachedBotInfo;
    }
  } catch (err) {
    console.error('Error fetching getMe:', err.message);
  }
  return null;
}

// 1. Bot Status
app.get('/api/status', async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.json({
      connected: false,
      message: 'TELEGRAM_BOT_TOKEN is not set in environment variables.'
    });
  }

  const bot = await getBotInfo(token);
  if (bot) {
    res.json({
      connected: true,
      bot: {
        id: bot.id,
        username: bot.username,
        first_name: bot.first_name,
        can_join_groups: bot.can_join_groups,
        can_read_all_group_messages: bot.can_read_all_group_messages
      }
    });
  } else {
    res.json({
      connected: false,
      message: 'Invalid TELEGRAM_BOT_TOKEN or unable to reach Telegram API.'
    });
  }
});

// 2. Verify Channel by Link or @username or Chat ID
app.post('/api/channels/verify', async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured on server.' });
  }

  let { channelInput } = req.body;
  if (!channelInput) {
    return res.status(400).json({ error: 'Channel link or @username is required' });
  }

  // Sanitize input (handles https://t.me/channel, t.me/channel, @channel, or -100xxx)
  channelInput = channelInput.trim();
  if (channelInput.includes('t.me/')) {
    channelInput = channelInput.split('t.me/')[1].split('/')[0].split('?')[0];
  }
  if (!channelInput.startsWith('@') && !channelInput.startsWith('-')) {
    channelInput = `@${channelInput}`;
  }

  try {
    // 1. Get Chat details
    const chatRes = await axios.get(`https://api.telegram.org/bot${token}/getChat`, {
      params: { chat_id: channelInput }
    });

    if (!chatRes.data?.ok) {
      return res.status(404).json({ error: 'Could not find channel. Make sure it exists and is public, or use chat ID.' });
    }

    const chat = chatRes.data.result;

    // 2. Check bot admin status in this channel
    const bot = await getBotInfo(token);
    if (!bot) {
      return res.status(500).json({ error: 'Failed to verify bot information.' });
    }

    const memberRes = await axios.get(`https://api.telegram.org/bot${token}/getChatMember`, {
      params: { chat_id: chat.id, user_id: bot.id }
    });

    const member = memberRes.data?.result;
    if (!member || (member.status !== 'administrator' && member.status !== 'creator')) {
      return res.status(400).json({
        error: `Bot @${bot.username} is NOT an Administrator in "${chat.title}". Please add the bot as Admin with "Post Messages" permission first.`
      });
    }

    // Check post permission
    if (chat.type === 'channel' && member.can_post_messages === false) {
      return res.status(400).json({
        error: `Bot @${bot.username} is Admin, but missing "Post Messages" permission. Please enable posting in channel permissions.`
      });
    }

    let subscriberCount = null;
    try {
      const countRes = await axios.get(`https://api.telegram.org/bot${token}/getChatMemberCount`, {
        params: { chat_id: chat.id },
        timeout: 10000
      });
      if (countRes.data?.ok && Number.isFinite(countRes.data.result)) {
        subscriberCount = countRes.data.result;
      }
    } catch (countErr) {
      console.warn('Unable to load chat member count:', countErr.message);
    }

    const verifiedChannel = {
      id: String(chat.id),
      title: chat.title || chat.username || 'Channel',
      username: chat.username || '',
      type: chat.type,
      description: chat.description || '',
      subscriberCount,
      verifiedAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      channel: verifiedChannel
    });
  } catch (err) {
    console.error('Channel verification error:', err.response?.data || err.message);
    const msg = err.response?.data?.description || err.message;
    return res.status(400).json({
      error: `Verification failed: ${msg}. Make sure bot is added as Admin in the channel.`
    });
  }
});

// Refresh saved channels so the preview uses Telegram's actual audience count.
app.post('/api/channels/refresh', async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const { channelId } = req.body || {};
  if (!token || !channelId) {
    return res.status(400).json({ error: 'Bot token and channel ID are required.' });
  }

  try {
    const chatRes = await axios.get(`https://api.telegram.org/bot${token}/getChat`, {
      params: { chat_id: channelId },
      timeout: 10000
    });
    if (!chatRes.data?.ok) {
      return res.status(404).json({ error: 'Channel could not be refreshed.' });
    }

    const chat = chatRes.data.result;
    let subscriberCount = null;
    try {
      const countRes = await axios.get(`https://api.telegram.org/bot${token}/getChatMemberCount`, {
        params: { chat_id: chat.id },
        timeout: 10000
      });
      if (countRes.data?.ok && Number.isFinite(countRes.data.result)) {
        subscriberCount = countRes.data.result;
      }
    } catch (countErr) {
      console.warn('Unable to refresh chat member count:', countErr.message);
    }

    return res.json({
      success: true,
      channel: {
        id: String(chat.id),
        title: chat.title || chat.username || 'Channel',
        username: chat.username || '',
        type: chat.type,
        description: chat.description || '',
        subscriberCount
      }
    });
  } catch (err) {
    console.error('Channel refresh error:', err.response?.data || err.message);
    return res.status(400).json({ error: 'Channel details could not be refreshed.' });
  }
});

// Create a one-time Supabase upload URL for media over Vercel's request cap.
// The browser uploads directly to Storage; the service-role key never reaches it.
app.post('/api/storage/upload-url', async (req, res) => {
  const { fileName, contentType, size, initData } = req.body || {};
  const fileSize = Number(size);

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_SUPABASE_UPLOAD_BYTES) {
    return res.status(400).json({ success: false, error: 'Each media file can be up to 20 MB.' });
  }
  if (!isSupportedMediaType(contentType)) {
    return res.status(400).json({ success: false, error: 'Only image, video, audio, GIF, and voice media can be uploaded.' });
  }

  const telegramUser = verifyTelegramInitData(initData);
  if (!telegramUser) {
    return res.status(401).json({
      success: false,
      error: 'For files above 4 MB, open RICH STUDIO from inside Telegram and try again.'
    });
  }

  const config = getSupabaseConfig();
  if (!config) {
    return res.status(503).json({
      success: false,
      error: 'Supabase Storage is not configured yet. Add the Supabase environment variables and redeploy.'
    });
  }

  try {
    const storage = createClient(config.url, config.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    }).storage.from(config.bucket);
    const path = `rich-studio/${telegramUser.id}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error || !data) throw error || new Error('Could not create an upload URL.');

    const { data: publicData } = storage.getPublicUrl(path);
    return res.json({
      success: true,
      bucket: config.bucket,
      path: data.path,
      token: data.token,
      publicUrl: publicData.publicUrl
    });
  } catch (error) {
    console.error('Supabase upload URL error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Could not prepare Supabase upload. Confirm the rich-media bucket exists and is public.'
    });
  }
});

// 4. Publish Message to Channel
app.post('/api/send', parseMediaUploads, async (req, res) => {
  let payload = req.body;
  try {
    if (typeof req.body?.payload === 'string') {
      payload = JSON.parse(req.body.payload);
    }
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid message data.' });
  }

  const { channelId, blocks, keyboard } = payload;
  const attachments = req.files || [];

  const totalUploadBytes = attachments.reduce((total, file) => total + file.size, 0);
  if (totalUploadBytes > MAX_UPLOAD_BYTES) {
    return res.status(400).json({
      success: false,
      error: 'The combined upload size must be 4 MB or smaller on this Vercel deployment.'
    });
  }

  if (!channelId) {
    return res.status(400).json({ error: 'Target Channel ID is required' });
  }

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return res.status(400).json({ error: 'At least one content block is required' });
  }

  try {
    const service = new RichMessageService();
    const result = await service.sendToChannel({
      chatId: channelId,
      blocks,
      keyboard,
      attachments
    });
    res.json(result);
  } catch (err) {
    console.error('Error sending rich message:', err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.description || err.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel Serverless
export default app;

// Local development server listener
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Unified API server listening on port ${PORT}`);
  });
}
