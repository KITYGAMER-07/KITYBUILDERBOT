import express from 'express';
import { store } from '../store.js';
import { botManager } from '../bot.js';
import { RichMessageService } from '../richMessageService.js';
import axios from 'axios';

const router = express.Router();

// 1. Bot status & Info
router.get('/status', (req, res) => {
  const token = store.getBotToken();
  const botInfo = store.getBotInfo();
  const channels = store.getChannels();
  res.json({
    connected: !!(token && botInfo),
    bot: botInfo,
    channelCount: channels.length,
    hasToken: !!token
  });
});

// 2. Set / Update Bot Token
router.post('/bot/token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const result = await botManager.verifyAndInit(token.trim());
  if (result.success) {
    res.json({ success: true, bot: result.bot });
  } else {
    res.status(400).json({ success: false, error: result.error || 'Invalid Bot Token' });
  }
});

// 3. Channels List
router.get('/channels', (req, res) => {
  const channels = store.getChannels();
  res.json({ channels });
});

// 4. Manually add / verify channel by @username or ID
router.post('/channels/register', async (req, res) => {
  const { channelUsernameOrId } = req.body;
  if (!channelUsernameOrId) {
    return res.status(400).json({ error: 'Channel username or ID is required' });
  }

  const token = store.getBotToken();
  if (!token) {
    return res.status(400).json({ error: 'Bot token not configured' });
  }

  try {
    const formattedId = channelUsernameOrId.startsWith('@') || channelUsernameOrId.startsWith('-')
      ? channelUsernameOrId
      : `@${channelUsernameOrId}`;

    const chatRes = await axios.get(`https://api.telegram.org/bot${token}/getChat`, {
      params: { chat_id: formattedId }
    });

    if (chatRes.data && chatRes.data.ok) {
      const chat = chatRes.data.result;
      const channelData = {
        id: String(chat.id),
        title: chat.title || chat.username || 'Channel',
        username: chat.username || '',
        type: chat.type,
        permissions: {
          can_post_messages: true,
          can_edit_messages: true,
          can_delete_messages: true
        }
      };
      store.addOrUpdateChannel(channelData);
      return res.json({ success: true, channel: channelData });
    }
  } catch (err) {
    return res.status(400).json({
      error: err.response?.data?.description || 'Could not find channel or bot is not an admin.'
    });
  }
});

// 5. Delete Channel
router.delete('/channels/:id', (req, res) => {
  store.removeChannel(req.params.id);
  res.json({ success: true });
});

// 6. Send Rich Message to Channel
router.post('/send', async (req, res) => {
  const { channelId, blocks, keyboard } = req.body;

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
      keyboard
    });
    res.json(result);
  } catch (err) {
    console.error('Error in /api/send:', err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.description || err.message
    });
  }
});

// 7. Templates CRUD
router.get('/templates', (req, res) => {
  res.json({ templates: store.getTemplates() });
});

router.post('/templates', (req, res) => {
  const { template } = req.body;
  if (!template || !template.name) {
    return res.status(400).json({ error: 'Template name and content are required' });
  }
  const saved = store.saveTemplate(template);
  res.json({ success: true, template: saved });
});

router.delete('/templates/:id', (req, res) => {
  store.deleteTemplate(req.params.id);
  res.json({ success: true });
});

export default router;
