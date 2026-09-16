import React from 'react';
import { AlignLeft, Bookmark } from 'lucide-react';

export const FooterEditor = ({ block, onChange }) => {
  const isAnchor = block.type === 'anchor';

  if (isAnchor) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <Bookmark className="w-3.5 h-3.5 text-blue-400" />
          Anchor ID (Internal Link Bookmark)
        </div>
        <input
          type="text"
          value={block.name || ''}
          onChange={(e) => onChange({ ...block, name: e.target.value })}
          placeholder="e.g. section_pricing or faq_top"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
        Footer Text / Subtle Disclaimer
      </div>
      <input
        type="text"
        value={block.text || ''}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="e.g. © 2026 KITY RICH STUDIO. All rights reserved • Unsubscribe: @bot"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 italic"
      />
    </div>
  );
};
