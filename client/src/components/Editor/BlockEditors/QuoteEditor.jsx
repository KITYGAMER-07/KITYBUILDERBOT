import React from 'react';
import { Quote, MessageSquareQuote } from 'lucide-react';

export const QuoteEditor = ({ block, onChange }) => {
  const isPull = block.type === 'pullquote';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          {isPull ? <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" /> : <Quote className="w-3.5 h-3.5 text-blue-400" />}
          {isPull ? 'Pull Quote (High-Impact Highlight)' : 'Blockquote'}
        </span>

        {!isPull && (
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={!!block.expandable}
              onChange={(e) => onChange({ ...block, expandable: e.target.checked })}
              className="rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0"
            />
            <span>Make Expandable (Collapsible)</span>
          </label>
        )}
      </div>

      <textarea
        rows={2}
        value={block.text || ''}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder={isPull ? 'Enter prominent headline quote text...' : 'Enter quotation text...'}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 italic"
      />

      {isPull && (
        <div>
          <input
            type="text"
            value={block.author || ''}
            onChange={(e) => onChange({ ...block, author: e.target.value })}
            placeholder="Author / Source credit (e.g. — Steve Jobs)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
};
