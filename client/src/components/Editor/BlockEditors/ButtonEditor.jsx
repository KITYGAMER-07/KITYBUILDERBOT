import React from 'react';
import { Plus, Trash2, MousePointerClick, Globe, AppWindow, Copy, Share2 } from 'lucide-react';

export const ButtonEditor = ({ block, onChange }) => {
  const buttonRows = block.buttons || [
    [
      { text: '🌐 Official Website', type: 'url', url: 'https://telegram.org' },
      { text: '📱 Mini App', type: 'webapp', url: 'https://telegram.org' }
    ]
  ];

  const updateButton = (rowIdx, btnIdx, field, value) => {
    const newRows = buttonRows.map((row, rIdx) => {
      if (rIdx === rowIdx) {
        return row.map((btn, bIdx) => {
          if (bIdx === btnIdx) {
            return { ...btn, [field]: value };
          }
          return btn;
        });
      }
      return row;
    });
    onChange({ ...block, buttons: newRows });
  };

  const addRow = () => {
    onChange({
      ...block,
      buttons: [...buttonRows, [{ text: 'New Button', type: 'url', url: 'https://' }]]
    });
  };

  const addButtonToRow = (rowIdx) => {
    const newRows = buttonRows.map((row, rIdx) => {
      if (rIdx === rowIdx) {
        if (row.length >= 8) {
          alert('Maximum 8 buttons per row recommended.');
          return row;
        }
        return [...row, { text: 'New Button', type: 'url', url: 'https://' }];
      }
      return row;
    });
    onChange({ ...block, buttons: newRows });
  };

  const removeButton = (rowIdx, btnIdx) => {
    let newRows = buttonRows.map((row, rIdx) => {
      if (rIdx === rowIdx) {
        return row.filter((_, bIdx) => bIdx !== btnIdx);
      }
      return row;
    }).filter(row => row.length > 0);

    if (newRows.length === 0) {
      newRows = [[{ text: 'Button', type: 'url', url: 'https://' }]];
    }
    onChange({ ...block, buttons: newRows });
  };

  const removeRow = (rowIdx) => {
    if (buttonRows.length <= 1) return;
    onChange({
      ...block,
      buttons: buttonRows.filter((_, rIdx) => rIdx !== rowIdx)
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
          Interactive Buttons ({buttonRows.length} Rows)
        </span>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-xs font-medium border border-slate-700"
        >
          <Plus className="w-3 h-3" /> Add Button Row
        </button>
      </div>

      <div className="space-y-3">
        {buttonRows.map((row, rowIdx) => (
          <div key={rowIdx} className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-semibold">Row #{rowIdx + 1} ({row.length} buttons)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addButtonToRow(rowIdx)}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add Column
                </button>
                {buttonRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(rowIdx)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {row.map((btn, btnIdx) => (
                <div key={btnIdx} className="bg-slate-950 border border-slate-800 rounded p-2 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={btn.text || ''}
                      onChange={(e) => updateButton(rowIdx, btnIdx, 'text', e.target.value)}
                      placeholder="Button Label (e.g. 🌐 Visit Website)"
                      className="min-w-0 w-full flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-2 sm:py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    />

                    <select
                      value={btn.type || 'url'}
                      onChange={(e) => updateButton(rowIdx, btnIdx, 'type', e.target.value)}
                      className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-2 sm:py-1 focus:outline-none focus:border-blue-500"
                    >
                      <option value="url">🌐 URL Link</option>
                      <option value="webapp">📱 Mini App</option>
                      <option value="copy_text">📋 Copy Text</option>
                      <option value="switch_inline_query">🔄 Share / Switch</option>
                      <option value="callback">⚡ Callback Action</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeButton(rowIdx, btnIdx)}
                      className="self-end sm:self-auto text-slate-500 hover:text-red-400 p-2 sm:p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {btn.type === 'copy_text' ? (
                    <input
                      type="text"
                      value={btn.text_to_copy || ''}
                      onChange={(e) => updateButton(rowIdx, btnIdx, 'text_to_copy', e.target.value)}
                      placeholder="Text to copy to clipboard on click (e.g. PROMO2026)"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-amber-300 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  ) : (
                    <input
                      type="text"
                      value={btn.url || ''}
                      onChange={(e) => updateButton(rowIdx, btnIdx, 'url', e.target.value)}
                      placeholder={btn.type === 'webapp' ? 'Mini App URL (https://...)' : 'Target Link URL (https://...)'}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-blue-300 focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
