import axios from 'axios';
import FormData from 'form-data';

const MAX_SUPABASE_MEDIA_BYTES = 20 * 1024 * 1024;

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
    const payloadText = JSON.stringify(payload);
    const referencedAttachments = attachments.filter(file =>
      payloadText.includes(`attach://${file.fieldname}`)
    );

    if (!referencedAttachments.length) {
      return axios.post(url, payload, { timeout: 30000 });
    }

    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      form.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
    referencedAttachments.forEach(file => {
      form.append(file.fieldname, file.stream || file.buffer, {
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

  isTrustedSupabaseUrl(value) {
    try {
      const configuredUrl = new URL(process.env.SUPABASE_URL);
      const mediaUrl = new URL(value);
      return mediaUrl.protocol === 'https:' && mediaUrl.origin === configuredUrl.origin;
    } catch {
      return false;
    }
  }

  async prepareSupabaseAttachments(blocks = [], attachments = []) {
    let mediaIndex = 0;
    let totalBytes = 0;
    const storageAttachments = [];

    const resolveMedia = async (media) => {
      if (!media?.storageSource || media.storageSource !== 'supabase') return media;
      if (!this.isTrustedSupabaseUrl(media.url)) {
        throw new Error('The uploaded media URL is not trusted by this deployment.');
      }

      const response = await axios.get(media.url, {
        responseType: 'arraybuffer',
        maxContentLength: MAX_SUPABASE_MEDIA_BYTES,
        maxBodyLength: MAX_SUPABASE_MEDIA_BYTES,
        timeout: 30000
      });
      const buffer = Buffer.from(response.data);
      if (!buffer.length || buffer.length > MAX_SUPABASE_MEDIA_BYTES) {
        throw new Error('Uploaded media must be 20 MB or smaller.');
      }
      totalBytes += buffer.length;
      if (totalBytes > MAX_SUPABASE_MEDIA_BYTES) {
        throw new Error('The combined media size must be 20 MB or smaller per post.');
      }

      const fieldname = `supabase_media_${mediaIndex++}`;
      storageAttachments.push({
        fieldname,
        buffer,
        originalname: media.fileName || `${fieldname}.bin`,
        mimetype: media.mimeType || response.headers['content-type'] || 'application/octet-stream'
      });
      return { ...media, url: `attach://${fieldname}` };
    };

    const resolvedBlocks = await Promise.all(blocks.map(async (block) => {
      if (['photo', 'video', 'animation', 'audio', 'voice'].includes(block.type)) {
        return resolveMedia(block);
      }
      if (['slideshow', 'collage'].includes(block.type)) {
        const items = await Promise.all((block.items || []).map(resolveMedia));
        return { ...block, items };
      }
      return block;
    }));

    return { blocks: resolvedBlocks, attachments: [...attachments, ...storageAttachments] };
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
          const language = block.language && block.language !== 'plaintext'
            ? block.language
            : undefined;
          richBlocks.push({
            type: 'pre',
            text: block.code || '',
            ...(language ? { language } : {})
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

    // A YouTube/website URL is a page, not an audio or video file. Sending it
    // to Telegram as InputMedia makes Telegram try to download it as media and
    // produces “failed to get HTTP URL content”. Keep such URLs as rich links.
    if (!this.isLikelyDirectMediaUrl(url)) {
      return this.createLinkBlock(url, caption);
    }

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

  isLikelyDirectMediaUrl(value) {
    const url = String(value || '').trim();
    if (!/^https?:\/\//i.test(url)) return true;

    try {
      const { pathname } = new URL(url);
      return /\.(?:avif|gif|jpe?g|png|webp|bmp|mp4|m4v|mov|webm|avi|mkv|mp3|m4a|aac|ogg|opus|wav|flac)$/i.test(pathname);
    } catch {
      return false;
    }
  }

  createLinkBlock(url, caption = '') {
    let label = String(caption || '').trim();
    if (!label) {
      try {
        label = new URL(url).hostname.replace(/^www\./i, '') || 'Open link';
      } catch {
        label = 'Open link';
      }
    }
    return {
      type: 'paragraph',
      text: { type: 'url', text: label.slice(0, 512), url }
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

  getCodeCopyRows(blocks = []) {
    const codeBlocks = blocks.filter(block => (
      block.type === 'code'
      && block.showCopyButton === true
      && typeof block.code === 'string'
      && block.code.length > 0
    ));

    const copyableBlocks = codeBlocks
      .filter(block => Buffer.byteLength(block.code, 'utf8') <= 256);

    return copyableBlocks
      .map((block, index) => ([{
        text: copyableBlocks.length > 1 ? `Copy Code ${index + 1}` : 'Copy Code',
        copy_text: { text: block.code }
      }]));
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
        case 'photo':
        case 'video':
        case 'animation':
        case 'audio':
        case 'voice': {
          html += this.mediaLinkToHTML(block.url, block.caption || block.title || 'Open media');
          break;
        }
        case 'slideshow':
        case 'collage': {
          (block.items || []).forEach((item) => {
            html += this.mediaLinkToHTML(item.url, item.caption || 'Open media');
          });
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

  escapeAttribute(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  mediaLinkToHTML(url, label) {
    if (!url || !/^https?:\/\//i.test(url)) return '';
    const text = this.escapeHTML(label || url);
    return `${text}\n<a href="${this.escapeAttribute(url)}">${this.escapeHTML(url)}</a>\n\n`;
  }

  getFallbackMediaEntries(blocks = []) {
    const entries = [];

    for (const block of blocks) {
      if (['photo', 'video', 'animation', 'audio', 'voice'].includes(block.type) && block.url) {
        entries.push({
          type: block.type,
          url: block.url,
          caption: block.caption || '',
          collection: null,
          has_spoiler: !!block.has_spoiler,
          duration: block.duration,
          title: block.title,
          performer: block.performer
        });
      }

      if (['slideshow', 'collage'].includes(block.type)) {
        (block.items || []).forEach(item => {
          if (!item.url) return;
          entries.push({
            type: item.type || 'photo',
            url: item.url,
            caption: item.caption || '',
            collection: block.type
          });
        });
      }
    }

    return entries;
  }

  async sendFallbackMedia({ chatId, blocks, compiledHTML, replyMarkup, attachments }) {
    const entries = this.getFallbackMediaEntries(blocks);
    if (!entries.length) return null;

    const collection = entries.filter(entry => entry.collection && ['photo', 'video'].includes(entry.type));
    if (collection.length > 1) {
      const media = collection.map((entry, index) => ({
        type: entry.type,
        media: entry.url,
        ...(index === 0 && (compiledHTML || entry.caption)
          ? { caption: (compiledHTML || entry.caption).slice(0, 1024), parse_mode: 'HTML' }
          : {})
      }));

      const mediaRes = await this.postToTelegram('sendMediaGroup', { chat_id: chatId, media }, attachments);
      if (replyMarkup || compiledHTML.length > 1024) {
        const followupRes = await this.postToTelegram('sendMessage', {
          chat_id: chatId,
          text: compiledHTML || 'Media post',
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        }, attachments);
        return { method: 'sendMediaGroup+sendMessage', data: followupRes.data };
      }
      return { method: 'sendMediaGroup', data: mediaRes.data };
    }

    const primary = entries[0];
    const methodByType = {
      photo: 'sendPhoto',
      video: 'sendVideo',
      animation: 'sendAnimation',
      audio: 'sendAudio',
      voice: 'sendVoice',
      voice_note: 'sendVoice'
    };
    const fieldByType = {
      photo: 'photo',
      video: 'video',
      animation: 'animation',
      audio: 'audio',
      voice: 'voice',
      voice_note: 'voice'
    };
    const method = methodByType[primary.type] || 'sendPhoto';
    const field = fieldByType[primary.type] || 'photo';
    const mediaPayload = {
      chat_id: chatId,
      [field]: primary.url,
      ...(compiledHTML || primary.caption
        ? { caption: (compiledHTML || primary.caption).slice(0, 1024), parse_mode: 'HTML' }
        : {}),
      ...(replyMarkup ? { reply_markup: replyMarkup } : {})
    };

    if (primary.type === 'video') {
      mediaPayload.supports_streaming = true;
      mediaPayload.has_spoiler = !!primary.has_spoiler;
    }
    if (primary.type === 'photo') mediaPayload.has_spoiler = !!primary.has_spoiler;
    if (primary.type === 'audio') {
      if (primary.title) mediaPayload.title = primary.title;
      if (primary.performer) mediaPayload.performer = primary.performer;
    }
    if ((primary.type === 'voice' || primary.type === 'voice_note') && primary.duration) {
      mediaPayload.duration = Number(primary.duration) || undefined;
    }

    const mediaRes = await this.postToTelegram(method, mediaPayload, attachments);
    if (compiledHTML.length > 1024) {
      const followupRes = await this.postToTelegram('sendMessage', {
        chat_id: chatId,
        text: compiledHTML,
        parse_mode: 'HTML'
      }, attachments);
      return { method: `${method}+sendMessage`, data: followupRes.data };
    }
    return { method, data: mediaRes.data };
  }

  /**
   * Main dispatch method: Publishes to Telegram Channel
   */
  async sendToChannel({ chatId, blocks = [], keyboard = [], attachments = [] }) {
    const prepared = await this.prepareSupabaseAttachments(blocks, attachments);
    blocks = prepared.blocks;
    attachments = prepared.attachments;

    // Telegram desktop renders native rich <pre> blocks correctly, but some
    // mobile clients flatten them into plain text. Send code as classic HTML
    // messages while preserving rich messages for every other block.
    const hasCodeBlocks = blocks.some(block => block.type === 'code' && String(block.code || '').trim());
    if (!hasCodeBlocks) {
      return this.sendRichBlocksToChannel({ chatId, blocks, keyboard, attachments });
    }

    const results = [];
    let pendingBlocks = [];
    const flushPendingBlocks = async (isLastSegment = false) => {
      if (!pendingBlocks.length) return;
      results.push(await this.sendRichBlocksToChannel({
        chatId,
        blocks: pendingBlocks,
        keyboard: isLastSegment ? keyboard : [],
        attachments
      }));
      pendingBlocks = [];
    };

    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      if (block.type !== 'code') {
        pendingBlocks.push(block);
        continue;
      }

      await flushPendingBlocks(false);
      if (String(block.code || '').trim()) {
        results.push(await this.sendClassicCodeBlock({ chatId, block }));
      }
    }
    await flushPendingBlocks(true);

    const fallbackResult = results.find(result => result.fallback);
    return {
      success: true,
      ...(fallbackResult ? { fallback: true, warning: fallbackResult.warning } : {}),
      method: 'sendRichMessage_with_classic_code',
      data: results.map(result => result.data)
    };
  }

  async sendClassicCodeBlock({ chatId, block }) {
    const language = String(block.language || '').replace(/[^a-z0-9_+-]/gi, '');
    const languageClass = language && language !== 'plaintext'
      ? ` class="language-${language}"`
      : '';
    const copyRows = this.getCodeCopyRows([block]);
    const response = await this.postToTelegram('sendMessage', {
      chat_id: chatId,
      text: `<pre><code${languageClass}>${this.escapeHTML(block.code)}</code></pre>`,
      parse_mode: 'HTML',
      ...(copyRows.length ? { reply_markup: { inline_keyboard: copyRows } } : {})
    });
    return { success: true, method: 'sendMessage_code', data: response.data };
  }

  async sendRichBlocksToChannel({ chatId, blocks = [], keyboard = [], attachments = [] }) {
    const richBlocks = this.compileRichBlocks(blocks);
    
    let inlineKeyboard = [];
    const buttonBlock = blocks.find(b => b.type === 'buttons');
    if (buttonBlock && buttonBlock.buttons) {
      inlineKeyboard = this.formatInlineKeyboard(buttonBlock.buttons);
    } else if (keyboard && keyboard.length > 0) {
      inlineKeyboard = this.formatInlineKeyboard(keyboard);
    }
    const codeCopyRows = this.getCodeCopyRows(blocks);

    // 1. Try sendRichMessage first
    try {
      const richPayload = {
        chat_id: chatId,
        rich_message: { blocks: richBlocks },
        ...(codeCopyRows.length ? { reply_markup: { inline_keyboard: codeCopyRows } } : {})
      };

      const response = await this.postToTelegram('sendRichMessage', richPayload, attachments);
      return { success: true, method: 'sendRichMessage', data: response.data };
    } catch (richErr) {
      console.warn(`sendRichMessage fallback: ${richErr?.response?.data?.description || richErr.message}`);

      // 2. Standard Telegram fallback. This keeps every media type visible if
      // Telegram rejects a remote URL for a native rich-media block.
      const compiledHTML = this.blocksToHTML(blocks);
      const fallbackKeyboard = [...inlineKeyboard, ...codeCopyRows];
      const replyMarkup = fallbackKeyboard.length > 0 ? { inline_keyboard: fallbackKeyboard } : undefined;

      let mediaFallback = null;
      try {
        mediaFallback = await this.sendFallbackMedia({
          chatId,
          blocks,
          compiledHTML,
          replyMarkup,
          attachments
        });
      } catch (mediaErr) {
        console.warn(`standard media fallback: ${mediaErr?.response?.data?.description || mediaErr.message}`);
        const linkRes = await this.postToTelegram('sendMessage', {
          chat_id: chatId,
          text: compiledHTML || 'Open media link',
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
          link_preview_options: { prefer_large_media: true }
        });
        return {
          success: true,
          fallback: true,
          warning: 'Telegram could not fetch that URL as a media file, so it was sent as a clickable link.',
          method: 'sendMessage_link',
          data: linkRes.data
        };
      }
      if (mediaFallback) {
        return {
          success: true,
          fallback: true,
          warning: richErr?.response?.data?.description || 'Telegram rejected the rich-media URL, so it was sent as standard Telegram media.',
          ...mediaFallback
        };
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
      return {
        success: true,
        fallback: true,
        warning: richErr?.response?.data?.description || 'Telegram rejected native rich formatting, so HTML formatting was used.',
        method: 'sendMessage_HTML',
        data: sendRes.data
      };
    }
  }
}
