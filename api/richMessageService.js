import axios from 'axios';
import FormData from 'form-data';

export class RichMessageService {
  constructor(token) {
    this.token = token || process.env.TELEGRAM_BOT_TOKEN;
  }

  getBaseUrl() {
    const token = this.token || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is not configured.');
    }
    return `https://api.telegram.org/bot${token}`;
  }

  async postToTelegram(method, payload, attachments = []) {
    const url = `${this.getBaseUrl()}/${method}`;

    if (!attachments.length) {
      return axios.post(url, payload, { timeout: 30000 });
    }

    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      form.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
    attachments.forEach(file => {
      form.append(file.fieldname, file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });
    });

    return axios.post(url, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 30000
    });
  }

  /**
   * Convert visual editor blocks into Telegram Bot API 10.x InputRichBlock structure
   */
  compileRichBlocks(blocks = []) {
    const richBlocks = [];

    for (const block of blocks) {
      switch (block.type) {
        case 'heading': {
          richBlocks.push({
            type: 'heading',
            text: block.text || '',
            size: Math.min(6, Math.max(1, Number(block.level) || 1))
          });
          break;
        }

        case 'paragraph': {
          richBlocks.push({
            type: 'paragraph',
            text: block.text || ''
          });
          break;
        }

        case 'table': {
          const headers = block.headers || [];
          const rows = block.rows || [];
          const cells = [
            ...(headers.length
              ? [headers.map(header => ({ text: String(header || ''), is_header: true }))]
              : []),
            ...rows.map(row => (row || []).map(cell => ({ text: String(cell || '') })))
          ];
          if (cells.length) {
            richBlocks.push({
              type: 'table',
              cells,
              is_bordered: true,
              is_compact: true
            });
          }
          break;
        }

        case 'list': {
          const isChecklist = block.listType === 'checklist';
          const isNumbered = block.listType === 'numbered';
          richBlocks.push({
            type: 'list',
            items: (block.items || []).map((item, index) => {
              const itemText = typeof item === 'object' ? item.text || '' : String(item || '');
              return {
                blocks: [{ type: 'paragraph', text: itemText }],
                ...(isChecklist ? { has_checkbox: true, is_checked: !!item?.checked } : {}),
                ...(isNumbered ? { value: index + 1 } : {})
              };
            })
          });
          break;
        }

        case 'details': {
          richBlocks.push({
            type: 'details',
            summary: block.title || 'Click to expand',
            blocks: [{ type: 'paragraph', text: block.content || '' }]
          });
          break;
        }

        case 'blockquote': {
          if (block.expandable) {
            richBlocks.push({
              type: 'expandable_blockquote',
              text: block.text || ''
            });
          } else {
            richBlocks.push({
              type: 'blockquote',
              blocks: [{ type: 'paragraph', text: block.text || '' }]
            });
          }
          break;
        }

        case 'pullquote': {
          richBlocks.push({
            type: 'pullquote',
            text: block.text || '',
            ...(block.author ? { credit: block.author } : {})
          });
          break;
        }

        case 'code': {
          richBlocks.push({
            type: 'pre',
            text: block.code || '',
            language: block.language || 'plaintext'
          });
          break;
        }

        case 'math': {
          richBlocks.push({
            type: 'mathematical_expression',
            expression: block.expression || ''
          });
          break;
        }

        case 'slideshow': {
          const mediaBlocks = (block.items || [])
            .map(item => this.createMediaBlock(item.type || 'photo', item.url, item.caption))
            .filter(Boolean);
          if (mediaBlocks.length) richBlocks.push({ type: 'slideshow', blocks: mediaBlocks });
          break;
        }

        case 'collage': {
          const mediaBlocks = (block.items || [])
            .map(item => this.createMediaBlock(item.type || 'photo', item.url, item.caption))
            .filter(Boolean);
          if (mediaBlocks.length) richBlocks.push({ type: 'collage', blocks: mediaBlocks });
          break;
        }

        case 'photo': {
          const mediaBlock = this.createMediaBlock('photo', block.url, block.caption, {
            has_spoiler: !!block.has_spoiler
          });
          if (mediaBlock) richBlocks.push(mediaBlock);
          break;
        }

        case 'video': {
          const mediaBlock = this.createMediaBlock('video', block.url, block.caption, {
            has_spoiler: !!block.has_spoiler,
            supports_streaming: true
          });
          if (mediaBlock) richBlocks.push(mediaBlock);
          break;
        }

        case 'animation': {
          const mediaBlock = this.createMediaBlock('animation', block.url, block.caption);
          if (mediaBlock) richBlocks.push(mediaBlock);
          break;
        }

        case 'voice': {
          const mediaBlock = this.createMediaBlock('voice_note', block.url, block.caption, {
            duration: Number(block.duration) || 0
          });
          if (mediaBlock) richBlocks.push(mediaBlock);
          break;
        }

        case 'audio': {
          const mediaBlock = this.createMediaBlock('audio', block.url, block.caption, {
            title: block.title || '',
            performer: block.performer || ''
          });
          if (mediaBlock) richBlocks.push(mediaBlock);
          break;
        }

        case 'map': {
          richBlocks.push({
            type: 'map',
            location: {
              latitude: parseFloat(block.latitude) || 0,
              longitude: parseFloat(block.longitude) || 0
            },
            ...(block.title ? { caption: { text: block.title } } : {})
          });
          break;
        }

        case 'divider': {
          richBlocks.push({
            type: 'divider'
          });
          break;
        }

        case 'anchor': {
          richBlocks.push({
            type: 'anchor',
            name: block.name || ''
          });
          break;
        }

        case 'footer': {
          richBlocks.push({
            type: 'footer',
            text: block.text || ''
          });
          break;
        }

        case 'buttons': {
          (block.buttons || []).forEach(row => {
            const buttons = row.slice(0, 8).map(btn => this.formatRichButton(btn));
            if (buttons.length) richBlocks.push({ type: 'buttons', buttons });
          });
          break;
        }

        default:
          break;
      }
    }

    return richBlocks;
  }

  createMediaBlock(type, url, caption = '', extra = {}) {
    if (!url) return null;

    const mediaFields = {
      photo: 'photo',
      video: 'video',
      animation: 'animation',
      audio: 'audio',
      voice_note: 'voice_note'
    };
    const field = mediaFields[type] || 'photo';
    const mediaType = field === 'voice_note' ? 'voice_note' : field;

    return {
      type: field,
      [field]: { type: mediaType, media: url, ...extra },
      ...(caption ? { caption: { text: caption } } : {})
    };
  }

  formatRichButton(btn = {}) {
    const text = String(btn.text || 'Button').trim().slice(0, 64) || 'Button';
    const type = btn.type || (btn.url ? 'url' : 'callback');
    const item = { text };

    if (type === 'url') {
      item.url = btn.url || 'https://t.me';
    } else if (type === 'webapp') {
      // Rich Web App buttons are not available in channel posts. A URL keeps
      // the button visible and opens the Mini App link from the channel.
      item.url = btn.url || 'https://t.me';
      item.style = 'primary';
    } else if (type === 'copy_text') {
      item.copy_text = { text: btn.text_to_copy || text };
    } else if (type === 'switch_inline_query') {
      item.switch_inline_query = btn.query || '';
    } else {
      item.callback_data = btn.callback_data || `btn_${Date.now()}`;
    }

    return item;
  }

  /**
   * Format buttons into Telegram InlineKeyboardMarkup format
   */
  formatInlineKeyboard(buttonRows = []) {
    return buttonRows.map(row => {
      return row.map(btn => {
        const item = { text: btn.text || 'Button' };
        if (btn.type === 'url' || (!btn.type && btn.url)) {
          item.url = btn.url || 'https://t.me';
        } else if (btn.type === 'webapp') {
          item.web_app = { url: btn.url || 'https://t.me' };
        } else if (btn.type === 'copy_text') {
          item.copy_text = { text: btn.text_to_copy || btn.text };
        } else if (btn.type === 'switch_inline_query') {
          item.switch_inline_query = btn.query || '';
        } else {
          item.callback_data = btn.callback_data || `btn_${Date.now()}`;
        }
        return item;
      });
    });
  }

  /**
   * Helper to format blocks into rich HTML representation for fallback
   */
  blocksToHTML(blocks = []) {
    let html = '';

    for (const block of blocks) {
      switch (block.type) {
        case 'heading': {
          html += `<b>${this.escapeHTML(block.text)}</b>\n\n`;
          break;
        }
        case 'paragraph': {
          html += `${block.text}\n\n`;
          break;
        }
        case 'table': {
          html += '<pre>';
          if (block.headers && block.headers.length > 0) {
            html += block.headers.join(' | ') + '\n';
            html += block.headers.map(() => '---').join('-|-') + '\n';
          }
          if (block.rows) {
            block.rows.forEach(row => {
              html += row.join(' | ') + '\n';
            });
          }
          html += '</pre>\n\n';
          break;
        }
        case 'list': {
          (block.items || []).forEach((item, idx) => {
            const isChecklist = block.listType === 'checklist';
            const isNumbered = block.listType === 'numbered';
            let marker = '• ';
            let text = typeof item === 'object' ? item.text : item;
            if (isChecklist) {
              marker = (item.checked ? '✅ ' : '⬜ ');
            } else if (isNumbered) {
              marker = `${idx + 1}. `;
            }
            html += `${marker}${this.escapeHTML(text)}\n`;
          });
          html += '\n';
          break;
        }
        case 'details': {
          html += `<blockquote><b>${this.escapeHTML(block.title)}</b>\n${this.escapeHTML(block.content)}</blockquote>\n\n`;
          break;
        }
        case 'blockquote': {
          const exp = block.expandable ? ' expandable' : '';
          html += `<blockquote${exp}>${this.escapeHTML(block.text)}</blockquote>\n\n`;
          break;
        }
        case 'pullquote': {
          html += `<blockquote><b>❝ ${this.escapeHTML(block.text)} ❞</b>${block.author ? `\n— <i>${this.escapeHTML(block.author)}</i>` : ''}</blockquote>\n\n`;
          break;
        }
        case 'code': {
          const lang = block.language ? ` class="language-${block.language}"` : '';
          html += `<pre><code${lang}>${this.escapeHTML(block.code)}</code></pre>\n\n`;
          break;
        }
        case 'math': {
          html += `<code>📐 Formula: ${this.escapeHTML(block.expression)}</code>\n\n`;
          break;
        }
        case 'divider': {
          html += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
          break;
        }
        case 'footer': {
          html += `<i>${this.escapeHTML(block.text)}</i>\n\n`;
          break;
        }
        case 'map': {
          html += `📍 <b>Location:</b> ${this.escapeHTML(block.title || 'Map Pin')} (<code>${block.latitude}, ${block.longitude}</code>)\n\n`;
          break;
        }
        default:
          break;
      }
    }

    return html.trim();
  }

  escapeHTML(text = '') {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Main dispatch method: Publishes to Telegram Channel
   */
  async sendToChannel({ chatId, blocks = [], keyboard = [], attachments = [] }) {
    const richBlocks = this.compileRichBlocks(blocks);
    
    let inlineKeyboard = [];
    const buttonBlock = blocks.find(b => b.type === 'buttons');
    if (buttonBlock && buttonBlock.buttons) {
      inlineKeyboard = this.formatInlineKeyboard(buttonBlock.buttons);
    } else if (keyboard && keyboard.length > 0) {
      inlineKeyboard = this.formatInlineKeyboard(keyboard);
    }

    // 1. Try sendRichMessage first
    try {
      const richPayload = {
        chat_id: chatId,
        rich_message: { blocks: richBlocks }
      };

      const response = await this.postToTelegram('sendRichMessage', richPayload, attachments);
      return { success: true, method: 'sendRichMessage', data: response.data };
    } catch (richErr) {
      console.warn(`sendRichMessage fallback: ${richErr?.response?.data?.description || richErr.message}`);

      // 2. Fallback to rich HTML formatting
      const photoBlock = blocks.find(b => b.type === 'photo');
      const slideshowBlock = blocks.find(b => b.type === 'slideshow');
      const compiledHTML = this.blocksToHTML(blocks);
      const replyMarkup = inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined;

      if (slideshowBlock && slideshowBlock.items && slideshowBlock.items.length > 1) {
        const media = slideshowBlock.items.map((item, idx) => ({
          type: item.type || 'photo',
          media: item.url,
          caption: idx === 0 ? compiledHTML.slice(0, 1024) : undefined,
          parse_mode: idx === 0 ? 'HTML' : undefined
        }));

        const mediaRes = await this.postToTelegram('sendMediaGroup', {
          chat_id: chatId,
          media
        }, attachments);

        if (replyMarkup || compiledHTML.length > 1024) {
          const followupRes = await this.postToTelegram('sendMessage', {
            chat_id: chatId,
            text: compiledHTML,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
          });
          return { success: true, method: 'sendMediaGroup+sendMessage', data: followupRes.data };
        }
        return { success: true, method: 'sendMediaGroup', data: mediaRes.data };
      }

      if (photoBlock && photoBlock.url) {
        const photoRes = await this.postToTelegram('sendPhoto', {
          chat_id: chatId,
          photo: photoBlock.url,
          caption: compiledHTML.slice(0, 1024),
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        }, attachments);
        return { success: true, method: 'sendPhoto', data: photoRes.data };
      }

      const sendRes = await this.postToTelegram('sendMessage', {
        chat_id: chatId,
        text: compiledHTML || 'Rich message',
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
        link_preview_options: {
          prefer_large_media: true
        }
      });
      return { success: true, method: 'sendMessage_HTML', data: sendRes.data };
    }
  }
}
