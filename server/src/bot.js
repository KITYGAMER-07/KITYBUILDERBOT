import axios from 'axios';
import { store } from './store.js';

export class TelegramBotManager {
  constructor() {
    this.isPolling = false;
    this.pollOffset = 0;
    this.pollingTimer = null;
  }

  async verifyAndInit(token) {
    if (!token) {
      token = store.getBotToken();
    }
    if (!token) {
      console.log('No bot token configured yet.');
      return { success: false, message: 'Bot token not set' };
    }

    try {
      const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
      if (response.data && response.data.ok) {
        const botInfo = response.data.result;
        store.setBotInfo(botInfo);
        store.setBotToken(token);
        console.log(`Telegram Bot verified: @${botInfo.username} (${botInfo.first_name})`);
        
        // Start polling for my_chat_member updates
        this.startPolling(token);
        return { success: true, bot: botInfo };
      }
    } catch (err) {
      console.error('Failed to verify Telegram Bot Token:', err.response?.data || err.message);
      return { success: false, error: err.response?.data?.description || err.message };
    }
  }

  startPolling(token) {
    if (this.isPolling) return;
    this.isPolling = true;
    console.log('Starting Telegram Bot update polling...');

    const poll = async () => {
      if (!this.isPolling) return;
      const currentToken = token || store.getBotToken();
      if (!currentToken) return;

      try {
        const res = await axios.get(`https://api.telegram.org/bot${currentToken}/getUpdates`, {
          params: {
            offset: this.pollOffset,
            timeout: 10,
            allowed_updates: ['message', 'my_chat_member', 'chat_member', 'callback_query']
          },
          timeout: 15000
        });

        if (res.data && res.data.ok && Array.isArray(res.data.result)) {
          for (const update of res.data.result) {
            this.pollOffset = update.update_id + 1;
            await this.handleUpdate(update, currentToken);
          }
        }
      } catch (err) {
        // Soft error handling for network hiccups during long polling
        if (err.code !== 'ECONNABORTED') {
          // Log only non-timeout errors
        }
      }

      if (this.isPolling) {
        this.pollingTimer = setTimeout(poll, 1500);
      }
    };

    poll();
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  async handleUpdate(update, token) {
    // 1. Handle bot added/updated in channel/group (my_chat_member)
    if (update.my_chat_member) {
      const { chat, new_chat_member } = update.my_chat_member;
      console.log(`Bot membership status changed in "${chat.title}" (${chat.id}):`, new_chat_member.status);

      if (new_chat_member.status === 'administrator') {
        // Bot was promoted to Admin!
        store.addOrUpdateChannel({
          id: String(chat.id),
          title: chat.title || 'Untitled Channel',
          username: chat.username || '',
          type: chat.type, // 'channel' | 'supergroup' | 'group'
          permissions: {
            can_post_messages: new_chat_member.can_post_messages ?? true,
            can_edit_messages: new_chat_member.can_edit_messages ?? true,
            can_delete_messages: new_chat_member.can_delete_messages ?? true
          }
        });
        console.log(`✅ Successfully auto-registered channel: "${chat.title}" [ID: ${chat.id}]`);
      } else if (new_chat_member.status === 'left' || new_chat_member.status === 'kicked') {
        // Bot was removed
        store.removeChannel(chat.id);
        console.log(`❌ Bot was removed from channel: "${chat.title}" [ID: ${chat.id}]`);
      }
    }

    // 2. Handle private commands (/start, /channels)
    if (update.message && update.message.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;

      if (text.startsWith('/start')) {
        const miniAppUrl = process.env.MINI_APP_URL || 'https://nova-automate.vercel.app';
        try {
          await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: `👋 <b>Welcome to NovaEsp Rich Message Builder!</b>\n\nEdit & publish stunning Rich Messages with Tables, Slideshows, Accordions, KaTeX Math & Buttons directly to your channels.\n\n✨ <b>How to connect:</b>\n1. Add this bot as an <b>Admin</b> to your Channel.\n2. Click the button below to launch the Rich Message Mini App.`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🚀 Open Rich Message Editor',
                    web_app: { url: miniAppUrl }
                  }
                ],
                [
                  {
                    text: '📢 My Channels',
                    callback_data: 'cmd_channels'
                  }
                ]
              ]
            }
          });
        } catch (e) {
          console.error('Error responding to /start:', e.message);
        }
      }
    }
  }
}

export const botManager = new TelegramBotManager();
