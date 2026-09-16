import axios from 'axios';

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

  /**
   * Convert visual editor blocks into Telegram Bot API 10.x InputRichBlock structure
   */
  compileRichBlocks(blocks = []) {
    const richBlocks = [];

    for (const block of blocks) {
      switch (block.type) {
        case 'heading': {
          richBlocks.push({
            type: 'section_heading',
            level: block.level || 1,
            text: block.text || ''
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
          richBlocks.push({
            type: 'table',
            headers: headers.map(h => ({ text: String(h) })),
            rows: rows.map(row => row.map(cell => ({ text: String(cell) })))
          });
          break;
        }

        case 'list': {
          richBlocks.push({
            type: 'list',
            list_type: block.listType || 'bullet',
            items: (block.items || []).map(item => {
              if (typeof item === 'object') {
                return { text: item.text || '', checked: !!item.checked };
              }
              return { text: String(item) };
            })
          });
          break;
        }

        case 'details': {
          richBlocks.push({
            type: 'details',
            title: block.title || 'Click to expand',
            content: block.content || ''
          });
          break;
        }

        case 'blockquote': {
          richBlocks.push({
            type: 'block_quotation',
            text: block.text || '',
            expandable: !!block.expandable
          });
          break;
        }

        case 'pullquote': {
          richBlocks.push({
            type: 'pull_quotation',
            text: block.text || '',
            author: block.author || ''
          });
          break;
        }

        case 'code': {
          richBlocks.push({
            type: 'preformatted',
            code: block.code || '',
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
          richBlocks.push({
            type: 'slideshow',
            items: (block.items || []).map(item => ({
              media: item.url || '',
              caption: item.caption || '',
              type: item.type || 'photo'
            }))
          });
          break;
        }

        case 'collage': {
          richBlocks.push({
            type: 'collage',
            items: (block.items || []).map(item => ({
              media: item.url || '',
              caption: item.caption || '',
              type: item.type || 'photo'
            }))
          });
          break;
        }

        case 'photo': {
          richBlocks.push({
            type: 'photo',
            photo: block.url || '',
            caption: block.caption || '',
            has_spoiler: !!block.has_spoiler
          });
          break;
        }

        case 'video': {
          richBlocks.push({
            type: 'video',
            video: block.url || '',
            caption: block.caption || '',
            has_spoiler: !!block.has_spoiler
          });
          break;
        }

        case 'animation': {
          richBlocks.push({
            type: 'animation',
            animation: block.url || '',
            caption: block.caption || ''
          });
          break;
        }

        case 'voice': {
          richBlocks.push({
            type: 'voice_note',
            voice: block.url || '',
            caption: block.caption || '',
            duration: block.duration || 0
          });
          break;
        }

        case 'audio': {
          richBlocks.push({
            type: 'audio',
            audio: block.url || '',
            caption: block.caption || '',
            title: block.title || '',
            performer: block.performer || ''
          });
          break;
        }

        case 'map': {
          richBlocks.push({
            type: 'map',
            latitude: parseFloat(block.latitude) || 0,
            longitude: parseFloat(block.longitude) || 0,
            title: block.title || 'Location'
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
          richBlocks.push({
            type: 'buttons',
            buttons: this.formatInlineKeyboard(block.buttons || [])
          });
          break;
        }

        default:
          break;
      }
    }

    return richBlocks;
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
          const prefix = block.level === 1 ? '<b>🌟 ' : '<b>▫️ ';
          html += `${prefix}${this.escapeHTML(block.text)}</b>\n\n`;
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
  async sendToChannel({ chatId, blocks = [], keyboard = [] }) {
    const baseUrl = this.getBaseUrl();
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
        blocks: richBlocks
      };
      if (inlineKeyboard.length > 0) {
        richPayload.reply_markup = { inline_keyboard: inlineKeyboard };
      }

      const response = await axios.post(`${baseUrl}/sendRichMessage`, richPayload, { timeout: 15000 });
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

        const mediaRes = await axios.post(`${baseUrl}/sendMediaGroup`, {
          chat_id: chatId,
          media
        });

        if (replyMarkup || compiledHTML.length > 1024) {
          const followupRes = await axios.post(`${baseUrl}/sendMessage`, {
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
        const photoRes = await axios.post(`${baseUrl}/sendPhoto`, {
          chat_id: chatId,
          photo: photoBlock.url,
          caption: compiledHTML.slice(0, 1024),
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        });
        return { success: true, method: 'sendPhoto', data: photoRes.data };
      }

      const sendRes = await axios.post(`${baseUrl}/sendMessage`, {
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
