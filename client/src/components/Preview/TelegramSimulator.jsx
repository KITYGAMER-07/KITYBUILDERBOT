import React, { useState } from 'react';
import {
  CheckCheck, Eye, Smile, Share2, MoreVertical,
  Volume2, ShieldCheck, Sun, Moon, Smartphone, Monitor
} from 'lucide-react';
import {
  MathBlockRenderer, CodeBlockRenderer, SlideshowRenderer,
  CollageRenderer, DetailsRenderer, TableRenderer,
  VoiceNoteRenderer, MapRenderer, ButtonsRenderer
} from './RichBlockRenderers';

export const TelegramSimulator = ({
  blocks = [],
  channel = { title: 'RICH STUDIO', username: 'rich_studio' },
  onToast
}) => {
  const audienceCount = channel.subscriberCount !== null && channel.subscriberCount !== undefined && Number.isFinite(Number(channel.subscriberCount))
    ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(channel.subscriberCount))
    : null;
  const audienceLabel = channel.type === 'channel' ? 'subscribers' : 'members';
  const [theme, setTheme] = useState('dark');
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  const toggleSpoiler = (id) => {
    setRevealedSpoilers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderBlock = (block, idx) => {
    switch (block.type) {
      case 'heading': {
        const sizeClass = block.level === 1 ? 'text-base font-extrabold text-white mt-1' : 'text-sm font-bold text-slate-100 mt-1';
        return (
          <div key={block.id || idx} className={`${sizeClass} leading-tight`}>
            {block.text}
          </div>
        );
      }

      case 'paragraph': {
        // Simple parser for <b>, <i>, <s>, <u>, <tg-spoiler>, <code>, <a>, <tg-emoji>
        const raw = block.text || '';
        return (
          <div
            key={block.id || idx}
            className="text-xs text-slate-200 leading-relaxed break-words"
            dangerouslySetInnerHTML={{ __html: formatTelegramHTML(raw) }}
          />
        );
      }

      case 'table':
        return <TableRenderer key={block.id || idx} headers={block.headers} rows={block.rows} />;

      case 'list': {
        const isCheck = block.listType === 'checklist';
        const isNum = block.listType === 'numbered';
        return (
          <div key={block.id || idx} className="my-1.5 space-y-1 text-xs text-slate-200">
            {(block.items || []).map((it, iIdx) => {
              const text = typeof it === 'object' ? it.text : it;
              const checked = typeof it === 'object' ? it.checked : false;
              return (
                <div key={iIdx} className="flex items-start gap-1.5">
                  {isCheck && (
                    <span className="text-blue-400 font-bold">{checked ? '☑' : '☐'}</span>
                  )}
                  {isNum && <span className="text-slate-400 font-mono">{iIdx + 1}.</span>}
                  {!isCheck && !isNum && <span className="text-slate-400 font-bold">•</span>}
                  <span className={isCheck && checked ? 'line-through text-slate-400' : ''}>{text}</span>
                </div>
              );
            })}
          </div>
        );
      }

      case 'details':
        return <DetailsRenderer key={block.id || idx} title={block.title} content={block.content} />;

      case 'blockquote': {
        return (
          <blockquote
            key={block.id || idx}
            className="my-1.5 pl-2.5 py-1 border-l-2 border-blue-400 bg-blue-500/10 text-xs text-slate-200 rounded-r"
          >
            {block.text}
          </blockquote>
        );
      }

      case 'pullquote': {
        return (
          <div
            key={block.id || idx}
            className="my-2 p-3 bg-gradient-to-r from-blue-950/60 to-purple-950/60 border-l-4 border-amber-400 rounded-r-lg text-center space-y-1 shadow-sm"
          >
            <p className="text-xs font-bold text-amber-200 italic">
              ❝ {block.text} ❞
            </p>
            {block.author && (
              <p className="text-[10px] text-slate-400">— {block.author}</p>
            )}
          </div>
        );
      }

      case 'code':
        return <CodeBlockRenderer key={block.id || idx} code={block.code} language={block.language} />;

      case 'math':
        return <MathBlockRenderer key={block.id || idx} expression={block.expression} />;

      case 'slideshow':
        return <SlideshowRenderer key={block.id || idx} items={block.items} />;

      case 'collage':
        return <CollageRenderer key={block.id || idx} items={block.items} />;

      case 'photo': {
        const mediaSource = block.localPreviewUrl || block.url;
        return (
          <div key={block.id || idx} className="my-2 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60">
            {mediaSource ? (
              <img src={mediaSource} alt="Post media" className="w-full max-h-72 object-cover" />
            ) : (
              <div className="h-36 flex items-center justify-center text-xs text-slate-600">No Image URL</div>
            )}
            {block.caption && <div className="p-2 text-xs text-slate-300">{block.caption}</div>}
          </div>
        );
      }

      case 'video': {
        const mediaSource = block.localPreviewUrl || block.url;
        return (
          <div key={block.id || idx} className="my-2 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/60">
            {mediaSource ? (
              <video src={mediaSource} controls className="w-full max-h-72 object-cover" />
            ) : (
              <div className="h-36 flex items-center justify-center text-xs text-slate-600">No Video URL</div>
            )}
            {block.caption && <div className="p-2 text-xs text-slate-300">{block.caption}</div>}
          </div>
        );
      }

      case 'animation': {
        const mediaSource = block.localPreviewUrl || block.url;
        return (
          <div key={block.id || idx} className="my-2 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60">
            {mediaSource ? (
              <img src={mediaSource} alt="GIF animation" className="w-full max-h-60 object-cover" />
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-slate-600">No GIF URL</div>
            )}
            {block.caption && <div className="p-2 text-xs text-slate-300">{block.caption}</div>}
          </div>
        );
      }

      case 'voice':
        return <VoiceNoteRenderer key={block.id || idx} duration={block.duration} caption={block.caption} />;

      case 'audio': {
        return (
          <div key={block.id || idx} className="my-2 p-2.5 bg-[#17212b] border border-slate-700 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{block.title || 'Audio Track'}</div>
              <div className="text-[11px] text-slate-400 truncate">{block.performer || 'Unknown Artist'}</div>
            </div>
          </div>
        );
      }

      case 'map':
        return <MapRenderer key={block.id || idx} latitude={block.latitude} longitude={block.longitude} title={block.title} />;

      case 'buttons':
        return <ButtonsRenderer key={block.id || idx} buttons={block.buttons} onToast={onToast} />;

      case 'divider':
        return <hr key={block.id || idx} className="my-2 border-slate-700/80" />;

      case 'footer':
        return (
          <div key={block.id || idx} className="mt-2 text-[11px] text-slate-400 italic">
            {block.text}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Simulator Top Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="ml-2 text-xs font-semibold text-slate-400">Telegram Live Preview</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Telegram Chat Viewport */}
      <div className={`flex-1 p-4 overflow-y-auto ${theme === 'dark' ? 'bg-[#0e1621]' : 'bg-[#e5ebee]'}`}>
        <div className="max-w-md mx-auto space-y-3">
          {/* Channel Header Info */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow">
                {channel.title?.charAt(0) || 'N'}
              </div>
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  <span>{channel.title || 'Channel Name'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-[10px] text-slate-400">
                  @{channel.username || 'channel'}{audienceCount ? ` • ${audienceCount} ${audienceLabel}` : ''}
                </div>
              </div>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>

          {/* Telegram Message Bubble */}
          <div className="bg-[#182533] text-white rounded-2xl rounded-tl-sm p-3.5 shadow-lg border border-slate-700/50 space-y-2">
            {/* Sender / Forward Header if applicable */}
            <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1 pb-0.5">
              <span>{channel.title || 'Channel'}</span>
            </div>

            {/* Render all Rich Blocks */}
            <div className="space-y-2">
              {blocks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 italic">
                  Your formatted message will appear here in real-time...
                </div>
              ) : (
                blocks.map((block, idx) => renderBlock(block, idx))
              )}
            </div>

            {/* Message Metadata (Views & Time) */}
            <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
              <Eye className="w-3 h-3" />
              <span>1.8K</span>
              <span>16:42</span>
              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>

          {/* Quick Telegram Channel Reactions Bar */}
          <div className="flex items-center gap-1.5 pl-1">
            {['🔥 42', '👍 128', '❤️ 84', '🚀 56'].map((react, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1 bg-[#182533]/80 border border-slate-700/60 rounded-full text-xs font-semibold text-slate-300 shadow-sm cursor-pointer hover:bg-slate-700/80 transition"
              >
                {react}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for formatting basic HTML tags safely in preview
function formatTelegramHTML(html = '') {
  let res = html
    .replace(/<tg-spoiler>(.*?)<\/tg-spoiler>/gi, '<span class="tg-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>')
    .replace(/<tg-emoji.*?>(.*?)<\/tg-emoji>/gi, '<span>$1</span>')
    .replace(/<a href="(.*?)">(.*?)<\/a>/gi, '<a href="$1" target="_blank" class="text-blue-400 hover:underline">$2</a>');
  return res;
}
