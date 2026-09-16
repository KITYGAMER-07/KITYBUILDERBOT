import React from 'react';
import { Type, Hash } from 'lucide-react';

export const HeadingEditor = ({ block, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Heading Level:</span>
        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
          {[1, 2, 3].map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange({ ...block, level: lvl })}
              className={`px-3 py-1 text-xs font-bold rounded ${
                (block.level || 1) === lvl
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              H{lvl}
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={block.text || ''}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Enter section heading title..."
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
      />
    </div>
  );
};
