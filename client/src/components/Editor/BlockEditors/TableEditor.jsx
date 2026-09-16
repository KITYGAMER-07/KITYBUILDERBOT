import React from 'react';
import { Plus, Trash2, Columns, Rows } from 'lucide-react';

export const TableEditor = ({ block, onChange }) => {
  const headers = block.headers || ['Column 1', 'Column 2'];
  const rows = block.rows || [['Data 1', 'Data 2']];

  const updateHeader = (index, value) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    onChange({ ...block, headers: newHeaders });
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = rows.map((r, rIdx) => {
      if (rIdx === rowIndex) {
        const newRow = [...r];
        newRow[colIndex] = value;
        return newRow;
      }
      return r;
    });
    onChange({ ...block, rows: newRows });
  };

  const addColumn = () => {
    if (headers.length >= 20) {
      alert('Telegram table supports up to 20 columns maximum.');
      return;
    }
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newRows = rows.map(r => [...r, '']);
    onChange({ ...block, headers: newHeaders, rows: newRows });
  };

  const removeColumn = (colIndex) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, idx) => idx !== colIndex);
    const newRows = rows.map(r => r.filter((_, idx) => idx !== colIndex));
    onChange({ ...block, headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRow = new Array(headers.length).fill('');
    onChange({ ...block, rows: [...rows, newRow] });
  };

  const removeRow = (rowIndex) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, idx) => idx !== rowIndex);
    onChange({ ...block, rows: newRows });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
          <Columns className="w-3.5 h-3.5 text-blue-400" />
          Table Grid ({headers.length} Columns × {rows.length} Rows)
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-xs font-medium border border-slate-700"
          >
            <Plus className="w-3 h-3" /> Add Column
          </button>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-xs font-medium border border-slate-700"
          >
            <Plus className="w-3 h-3" /> Add Row
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-700 rounded-lg bg-slate-900/50 p-2">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr>
              <th className="p-1 text-slate-500 w-8 text-center">#</th>
              {headers.map((h, colIdx) => (
                <th key={colIdx} className="p-1 min-w-[120px]">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => updateHeader(colIdx, e.target.value)}
                      placeholder={`Header ${colIdx + 1}`}
                      className="w-full bg-slate-800 border border-slate-700 font-bold text-white px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                    />
                    {headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(colIdx)}
                        title="Delete column"
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-t border-slate-800">
                <td className="p-1 text-slate-500 text-center font-mono">{rowIdx + 1}</td>
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="p-1">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                      placeholder="Cell value"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                    />
                  </td>
                ))}
                <td className="p-1 text-center">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(rowIdx)}
                      title="Delete row"
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
