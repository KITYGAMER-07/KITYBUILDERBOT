import React from 'react';
import { Image, Video, Music, Mic, EyeOff, Upload, X } from 'lucide-react';

const MAX_MEDIA_UPLOAD_BYTES = 20 * 1024 * 1024;

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
    if (isAnimation) return <Image className="w-3.5 h-3.5 text-amber-400" />;
    return <Image className="w-3.5 h-3.5 text-cyan-400" />;
  };

  const acceptedFiles = isPhoto
    ? 'image/*'
    : isVideo
    ? 'video/*'
    : isAnimation
    ? 'image/gif,video/mp4'
    : isAudio
    ? 'audio/*'
    : 'audio/ogg,audio/opus,audio/mpeg,audio/wav';

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
      alert('Each media file can be up to 20 MB.');
      event.target.value = '';
      return;
    }

    onChange({
      ...block,
      url: '',
      localFile: file,
      localPreviewUrl: URL.createObjectURL(file),
      fileName: file.name
    });
  };

  const clearSelectedFile = () => {
    if (block.localPreviewUrl) URL.revokeObjectURL(block.localPreviewUrl);
    onChange({
      ...block,
      localFile: undefined,
      localPreviewUrl: '',
      fileName: ''
    });
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

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          type="text"
          value={block.url || ''}
          onChange={(e) => onChange({
            ...block,
            url: e.target.value,
            localFile: undefined,
            localPreviewUrl: '',
            fileName: ''
          })}
          placeholder={`Paste direct ${block.type} file or webpage link (optional)`}
          className="min-w-0 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        />
        <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer text-xs font-semibold transition">
          <Upload className="w-3.5 h-3.5" />
          Choose file
          <input type="file" accept={acceptedFiles} onChange={handleFileSelect} className="hidden" />
        </label>
      </div>

      {block.localFile && (
        <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-xs">
          <span className="truncate text-emerald-200">Selected: {block.fileName || block.localFile.name}</span>
          <button type="button" onClick={clearSelectedFile} className="shrink-0 p-1 text-slate-400 hover:text-red-400" title="Remove selected file">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <p className="text-[11px] text-slate-500">
        Upload up to 20 MB total per post. Files above 4 MB use secure cloud upload. Webpage links, including YouTube, are sent as clickable links.
      </p>

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
