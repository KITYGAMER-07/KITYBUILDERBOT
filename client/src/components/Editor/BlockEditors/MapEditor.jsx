import React from 'react';
import { MapPin } from 'lucide-react';

export const MapEditor = ({ block, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <MapPin className="w-3.5 h-3.5 text-rose-500" />
        Map Location Embed
      </div>

      <input
        type="text"
        value={block.title || ''}
        onChange={(e) => onChange({ ...block, title: e.target.value })}
        placeholder="Location Name / Venue Title"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-500 uppercase">Latitude</label>
          <input
            type="number"
            step="any"
            value={block.latitude ?? 12.9716}
            onChange={(e) => onChange({ ...block, latitude: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 uppercase">Longitude</label>
          <input
            type="number"
            step="any"
            value={block.longitude ?? 77.5946}
            onChange={(e) => onChange({ ...block, longitude: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
