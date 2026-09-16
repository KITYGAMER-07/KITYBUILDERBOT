import React from 'react';
import { ChevronDownSquare } from 'lucide-react';

export const DetailsEditor = ({ block, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <ChevronDownSquare className="w-3.5 h-3.5 text-blue-400" />
        Fold / Accordion Header (Summary Title)
      </div>
      <input
        type="text"
        value={block.title || ''}
        onChange={(e) => onChange({ ...block, title: e.target.value })}
        placeholder="e.g. 📖 Click here to view Terms & Conditions..."
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
      />

      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider pt-1">
        Collapsible Content (Hidden until clicked)
      </div>
      <textarea
        rows={3}
        value={block.content || ''}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder="Enter details text that will be revealed when user expands this section..."
        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
      />
    </div>
  );
};
