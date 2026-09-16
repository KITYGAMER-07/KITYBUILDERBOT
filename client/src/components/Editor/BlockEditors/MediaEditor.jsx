import React from 'react';
import { Image, Video, Sparkles, Music, Mic, EyeOff } from 'lucide-react';

export const MediaEditor = ({ block, onChange }) => {
  const isVoice = block.type === 'voice';
  const isAudio = block.type === 'audio';
  const isVideo = block.type === 'video';
  const isAnimation = block.type === 'animation';
  const isPhoto = block.type === 'photo';

  const getIcon = () => {
    if (isVoice) return <Mic className="w-3.5 h-3.5 text-red-400" />;
    if (isAudio) return <Music className="w-3.5 h-3.5 text-purple-400" />;
    if (isVideo) return <Video className="w-3.5 h-3.5 text-blue-400" />;
    if (isAnimation) return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    return <Image className="w-3.5 h-3.5 text-cyan-400" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          {getIcon()}
          {block.type.toUpperCase()} Block
        </span>

        {(isPhoto || isVideo) && (
          <label className="flex items-center gap-1 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={!!block.has_spoiler}
              onChange={(e) => onChange({ ...block, has_spoiler: e.target.checked })}
              className="rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0"
            />
            <EyeOff className="w-3 h-3 text-yellow-400" />
            <span>Media Spoiler (Blur)</span>
          </label>
        )}
      </div>

      <input
        type="text"
        value={block.url || ''}
        onChange={(e) => onChange({ ...block, url: e.target.value })}
        placeholder={`Direct ${block.type} URL (https://...)`}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
      />

      {isAudio && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            placeholder="Track Title"
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={block.performer || ''}
            onChange={(e) => onChange({ ...block, performer: e.target.value })}
            placeholder="Artist / Performer"
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {isVoice && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Duration (seconds):</span>
          <input
            type="number"
            value={block.duration || 15}
            onChange={(e) => onChange({ ...block, duration: parseInt(e.target.value) || 0 })}
            className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      )}

      <input
        type="text"
        value={block.caption || ''}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Caption / Description (optional)..."
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};
