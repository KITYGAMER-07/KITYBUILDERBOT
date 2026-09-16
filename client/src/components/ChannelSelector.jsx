import React, { useState } from 'react';
import { Radio, Plus, CheckCircle, AlertCircle, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';

export const ChannelSelector = ({
  channels = [],
  selectedChannelId,
  onSelectChannel,
  onAddChannel,
  onDeleteChannel,
  botInfo
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setLoading(true);
    const success = await onAddChannel(inputVal.trim());
    setLoading(false);
    if (success) {
      setInputVal('');
      setShowAdd(false);
    }
  };

  const botUsername = botInfo?.username || 'YourBot';
  const addBotLink = `https://t.me/${botUsername}?startchannel=true&admin=post_messages+edit_messages+delete_messages`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Radio className="w-4 h-4 text-emerald-400" />
          Target Channels ({channels.length})
        </div>

        <div className="flex items-center gap-2">
          <a
            href={addBotLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md transition"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Add @{botUsername}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>

          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> Connect Channel
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-slate-950 p-3 rounded-xl border border-slate-700/80 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold">Enter Channel Link or Username:</span>
            <span className="text-[10px] text-slate-500">Ensure @{botUsername} is Admin</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. @my_channel or https://t.me/my_channel"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
            >
              {loading ? 'Verifying...' : 'Verify & Add'}
            </button>
          </div>
        </form>
      )}

      {/* Connected Channel Cards / Pills */}
      <div className="flex flex-wrap gap-2">
        {channels.length === 0 ? (
          <div className="w-full text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-dashed border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <span>No channels connected yet. Add our bot to your channel and connect above!</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="text-blue-400 hover:underline text-xs font-semibold shrink-0"
            >
              + Connect Now
            </button>
          </div>
        ) : (
          channels.map((ch) => {
            const isSelected = String(ch.id) === String(selectedChannelId);
            return (
              <div
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border text-xs transition select-none ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md font-semibold'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="font-semibold text-white truncate max-w-[140px]">{ch.title || ch.username || ch.id}</span>
                  {ch.username && <span className="text-[10px] text-slate-400 font-normal">@{ch.username}</span>}
                </div>

                {isSelected && <CheckCircle className="w-4 h-4 text-blue-400 ml-1" />}

                {/* Disconnect / Delete channel button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove "${ch.title || ch.username}" from your list?`)) {
                      onDeleteChannel(ch.id);
                    }
                  }}
                  title="Remove from saved channels"
                  className="p-1 text-slate-500 hover:text-red-400 rounded transition opacity-0 group-hover:opacity-100 ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
