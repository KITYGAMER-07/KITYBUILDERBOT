import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import { RichMessageService } from './richMessageService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Vercel functions receive uploads in memory. Keep the combined payload below
// the platform request limit while preserving direct-to-Telegram file uploads.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
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

    const verifiedChannel = {
      id: String(chat.id),
      title: chat.title || chat.username || 'Channel',
      username: chat.username || '',
      type: chat.type,
      description: chat.description || '',
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

// 3. Publish Message to Channel
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
