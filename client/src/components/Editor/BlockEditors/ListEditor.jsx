import React from 'react';
import { Plus, Trash2, List, ListOrdered, CheckSquare } from 'lucide-react';

export const ListEditor = ({ block, onChange }) => {
  const listType = block.listType || 'bullet';
  const items = block.items || ['Item 1', 'Item 2'];

  const setType = (type) => {
    // preserve check state if converting
    const formatted = items.map(it => {
      if (type === 'checklist') {
        return typeof it === 'object' ? it : { text: String(it), checked: false };
      } else {
        return typeof it === 'object' ? it.text : String(it);
      }
    });
    onChange({ ...block, listType: type, items: formatted });
  };

  const updateItem = (index, val) => {
    const newItems = [...items];
    if (listType === 'checklist') {
      const current = typeof newItems[index] === 'object' ? newItems[index] : { text: String(newItems[index]), checked: false };
      newItems[index] = { ...current, text: val };
    } else {
      newItems[index] = val;
    }
    onChange({ ...block, items: newItems });
  };

  const toggleChecked = (index) => {
    if (listType !== 'checklist') return;
    const newItems = [...items];
    const current = typeof newItems[index] === 'object' ? newItems[index] : { text: String(newItems[index]), checked: false };
    newItems[index] = { ...current, checked: !current.checked };
    onChange({ ...block, items: newItems });
  };

  const addItem = () => {
    const newItem = listType === 'checklist' ? { text: `New task ${items.length + 1}`, checked: false } : `New item ${items.length + 1}`;
    onChange({ ...block, items: [...items, newItem] });
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, idx) => idx !== index);
    onChange({ ...block, items: newItems });
  };

  return (
    <div className="space-y-3">
      {/* Type Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => setType('bullet')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
              listType === 'bullet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Bullet
          </button>
          <button
            type="button"
            onClick={() => setType('numbered')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
              listType === 'numbered' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" /> Numbered
          </button>
          <button
            type="button"
            onClick={() => setType('checklist')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
              listType === 'checklist' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Checklist
          </button>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-xs font-medium border border-slate-700"
        >
          <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-1.5">
        {items.map((item, idx) => {
          const itemText = typeof item === 'object' ? item.text : item;
          const isChecked = typeof item === 'object' ? item.checked : false;

          return (
            <div key={idx} className="flex items-center gap-2">
              {listType === 'bullet' && (
                <span className="text-slate-500 font-bold text-sm w-4 text-center">•</span>
              )}
              {listType === 'numbered' && (
                <span className="text-slate-500 font-mono text-xs w-5 text-center">{idx + 1}.</span>
              )}
              {listType === 'checklist' && (
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleChecked(idx)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                />
              )}
              <input
                type="text"
                value={itemText}
                onChange={(e) => updateItem(idx, e.target.value)}
                placeholder="List item text..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
