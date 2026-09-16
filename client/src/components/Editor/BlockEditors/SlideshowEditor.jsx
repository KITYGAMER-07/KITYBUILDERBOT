import React from 'react';
import { Plus, Trash2, Image, Layers } from 'lucide-react';

export const SlideshowEditor = ({ block, onChange }) => {
  const items = block.items || [{ url: '', caption: '' }];

  const updateItem = (index, field, value) => {
    const newItems = items.map((it, idx) => (idx === index ? { ...it, [field]: value } : it));
    onChange({ ...block, items: newItems });
  };

  const addItem = () => {
    if (items.length >= 10) {
      alert('Telegram albums & slideshows support up to 10 media items.');
      return;
    }
    onChange({
      ...block,
      items: [...items, { url: '', caption: `Slide ${items.length + 1}` }]
    });
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    onChange({ ...block, items: items.filter((_, idx) => idx !== index) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Slideshow Carousel ({items.length}/10 Slides)
        </span>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-xs font-medium border border-slate-700"
        >
          <Plus className="w-3 h-3" /> Add Slide
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold flex items-center gap-1">
                <Image className="w-3 h-3 text-slate-500" /> Slide #{idx + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <input
              type="text"
              value={item.url || ''}
              onChange={(e) => updateItem(idx, 'url', e.target.value)}
              placeholder="Direct Image / Video URL (https://...)"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />

            <input
              type="text"
              value={item.caption || ''}
              onChange={(e) => updateItem(idx, 'caption', e.target.value)}
              placeholder="Slide caption (optional)..."
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
