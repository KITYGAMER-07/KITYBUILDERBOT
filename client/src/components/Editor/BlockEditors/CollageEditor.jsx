import React from 'react';
import { Plus, Trash2, LayoutGrid, Image, Upload, X } from 'lucide-react';

const MAX_MEDIA_UPLOAD_BYTES = 20 * 1024 * 1024;

export const CollageEditor = ({ block, onChange }) => {
  const items = block.items || [{ url: '', caption: '' }];

  const updateItemData = (index, changes) => {
    const newItems = items.map((it, idx) => (idx === index ? { ...it, ...changes } : it));
    onChange({ ...block, items: newItems });
  };

  const handleFileSelect = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file for the collage.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
      alert('Each image can be up to 20 MB.');
      event.target.value = '';
      return;
    }
    if (items[index]?.localPreviewUrl) URL.revokeObjectURL(items[index].localPreviewUrl);
    updateItemData(index, {
      url: '',
      localFile: file,
      localPreviewUrl: URL.createObjectURL(file),
      fileName: file.name
    });
  };

  const clearSelectedFile = (index) => {
    if (items[index]?.localPreviewUrl) URL.revokeObjectURL(items[index].localPreviewUrl);
    updateItemData(index, { localFile: undefined, localPreviewUrl: '', fileName: '' });
  };

  const updateUrl = (index, url) => {
    if (items[index]?.localPreviewUrl) URL.revokeObjectURL(items[index].localPreviewUrl);
    updateItemData(index, { url, localFile: undefined, localPreviewUrl: '', fileName: '' });
  };

  const addItem = () => {
    if (items.length >= 10) {
      alert('Telegram collage supports up to 10 media items.');
      return;
    }
    onChange({
      ...block,
      items: [...items, { url: '', caption: `Photo ${items.length + 1}` }]
    });
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    if (items[index]?.localPreviewUrl) URL.revokeObjectURL(items[index].localPreviewUrl);
    onChange({ ...block, items: items.filter((_, idx) => idx !== index) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
          Collage Grid ({items.length}/10 Photos)
        </span>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-xs font-medium border border-slate-700"
        >
          <Plus className="w-3 h-3" /> Add Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold flex items-center gap-1">
                <Image className="w-3 h-3 text-slate-500" /> Image #{idx + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <input
              type="text"
              value={item.url || ''}
              onChange={(e) => updateUrl(idx, e.target.value)}
              placeholder="Paste image URL (optional)"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />

            <div className="flex min-w-0 items-center gap-2">
              <label className="shrink-0 flex items-center gap-1 rounded bg-blue-600 px-2 py-1.5 text-[11px] font-semibold text-white cursor-pointer hover:bg-blue-500 transition">
                <Upload className="w-3 h-3" /> Upload
                <input type="file" accept="image/*" onChange={(event) => handleFileSelect(idx, event)} className="hidden" />
              </label>
              {item.localFile && (
                <div className="min-w-0 flex flex-1 items-center justify-between gap-1 rounded border border-emerald-500/30 bg-emerald-950/30 px-2 py-1 text-[10px] text-emerald-200">
                  <span className="truncate">{item.fileName || item.localFile.name}</span>
                  <button type="button" onClick={() => clearSelectedFile(idx)} className="shrink-0 text-slate-400 hover:text-red-400" title="Remove selected image">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
