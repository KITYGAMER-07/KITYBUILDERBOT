import React, { useState } from 'react';
import { Crosshair, MapPin } from 'lucide-react';

export const MapEditor = ({ block, onChange }) => {
  const [locationMessage, setLocationMessage] = useState('');

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location access is not available in this browser.');
      return;
    }

    setLocationMessage('Getting your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({
          ...block,
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6))
        });
        setLocationMessage('Current location selected.');
      },
      () => setLocationMessage('Location permission was not granted.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <MapPin className="w-3.5 h-3.5 text-rose-500" />
        Map Location Embed
      </div>

      <button
        type="button"
        onClick={useCurrentLocation}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-900/40"
      >
        <Crosshair className="w-3.5 h-3.5" />
        Use my current location
      </button>
      {locationMessage && <p className="text-[11px] text-slate-500">{locationMessage}</p>}

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
