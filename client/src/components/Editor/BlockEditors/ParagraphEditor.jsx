import React, { useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, EyeOff, Code, Link, Smile } from 'lucide-react';

export const ParagraphEditor = ({ block, onChange }) => {
  const textareaRef = useRef(null);

  const applyTag = (openTag, closeTag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = block.text || '';
    const selected = currentText.substring(start, end);
    const replacement = `${openTag}${selected || 'text'}${closeTag}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
    onChange({ ...block, text: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + (selected ? selected.length : 4));
    }, 50);
  };

  const insertLink = () => {
    const url = prompt('Enter URL link:', 'https://');
    if (!url) return;
    applyTag(`<a href="${url}">`, '</a>');
  };

  const insertEmoji = () => {
    const emojiId = prompt('Enter Telegram Custom Emoji ID (or standard emoji):', '🔥');
    if (!emojiId) return;
    if (emojiId.length > 4 && /^\d+$/.test(emojiId)) {
      applyTag(`<tg-emoji emoji-id="${emojiId}">⭐`, '</tg-emoji>');
    } else {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const currentText = block.text || '';
      const newText = currentText.substring(0, start) + emojiId + currentText.substring(start);
      onChange({ ...block, text: newText });
    }
  };

  return (
    <div className="space-y-2">
      {/* Inline Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-700">
        <button
          type="button"
          onClick={() => applyTag('<b>', '</b>')}
          title="Bold (Ctrl+B)"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs flex items-center gap-1"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyTag('<i>', '</i>')}
          title="Italic"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyTag('<u>', '</u>')}
          title="Underline"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyTag('<s>', '</s>')}
          title="Strikethrough"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyTag('<tg-spoiler>', '</tg-spoiler>')}
          title="Spoiler (Hidden text)"
          className="p-1.5 text-yellow-400 hover:bg-slate-800 rounded text-xs flex items-center gap-1"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold">Spoiler</span>
        </button>
        <button
          type="button"
          onClick={() => applyTag('<code>', '</code>')}
          title="Inline Code"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={insertLink}
          title="Insert Link"
          className="p-1.5 text-blue-400 hover:bg-slate-800 rounded text-xs flex items-center gap-1"
        >
          <Link className="w-3.5 h-3.5" />
          <span className="text-[10px]">Link</span>
        </button>
        <button
          type="button"
          onClick={insertEmoji}
          title="Custom Emoji"
          className="p-1.5 text-amber-400 hover:bg-slate-800 rounded text-xs flex items-center gap-1"
        >
          <Smile className="w-3.5 h-3.5" />
          <span className="text-[10px]">Emoji</span>
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={3}
        value={block.text || ''}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Write formatted message paragraph (HTML supported: <b>bold</b>, <i>italic</i>, <tg-spoiler>spoiler</tg-spoiler>)..."
        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 font-normal leading-relaxed"
      />
    </div>
  );
};
