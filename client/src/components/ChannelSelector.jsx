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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Radio className="w-4 h-4 text-emerald-400" />
          Target Channels ({channels.length})
        </div>

        <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto sm:items-center">
          <a
            href={addBotLink}
            target="_blank"
            rel="noreferrer"
            className="h-9 justify-center whitespace-nowrap flex items-center gap-1 px-3 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg transition"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Add @{botUsername}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>

          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="h-9 w-full sm:w-40 justify-center whitespace-nowrap flex items-center gap-1 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
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
      <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
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
                className={`group relative flex h-9 w-full min-w-0 max-w-full items-center justify-center px-10 sm:w-40 rounded-lg cursor-pointer border text-xs font-semibold transition select-none ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20 ring-1 ring-blue-400/40'
                    : 'bg-blue-600/80 border-blue-500/70 text-white hover:bg-blue-500'
                }`}
              >
                <div className="absolute left-3 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="min-w-0 max-w-full text-center leading-tight">
                  <span className="block truncate font-semibold text-white">{ch.title || ch.username || ch.id}</span>
                  {ch.username && <span className="block truncate text-[10px] text-blue-100/80 font-normal">@{ch.username}</span>}
                </div>

                {isSelected && <CheckCircle className="absolute right-7 w-3.5 h-3.5 text-white" />}

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
                  className="absolute right-1 p-1 text-blue-100/70 hover:text-red-200 rounded transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
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
