import React, { useState } from 'react';
import {
  Send, HelpCircle, Trash2,
  CheckCircle, PlusCircle
} from 'lucide-react';

export const Header = ({
  botStatus,
  onOpenHowItWorks,
  onReset,
  onSend,
  isSending,
  selectedChannel,
  blockCount
}) => {
  const [logoUnavailable, setLogoUnavailable] = useState(false);
  const botUsername = botStatus?.bot?.username || 'KityStudioBot';
  const addBotLink = `https://t.me/${botUsername}?startchannel=true&admin=post_messages+edit_messages+delete_messages`;

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="w-8 h-8 shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-lg">
            {logoUnavailable ? (
              <span className="text-xs font-black">K</span>
            ) : (
              <img
                src="/logo.jpg"
                alt="RICH STUDIO logo"
                onError={() => setLogoUnavailable(true)}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center">
              <h1 className="truncate text-sm font-bold text-white tracking-wide">
                RICH STUDIO
              </h1>
            </div>
            <div className="hidden sm:block text-[11px] text-slate-400">
              Telegram Rich Message Builder & Multi-Channel Publisher
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-stretch gap-2 sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          {/* Bot Status & Add Bot Quick Button */}
          {botStatus?.connected ? (
            <a
              href={addBotLink}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 h-9 flex items-center gap-1.5 px-3 bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40 rounded-lg text-xs font-semibold transition"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">@{botUsername}</span>
              <PlusCircle className="w-3.5 h-3.5 text-blue-400 ml-0.5" />
            </a>
          ) : (
            <div className="min-w-0 h-9 flex items-center gap-1.5 px-3 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Checking Bot Status...</span>
            </div>
          )}

          {/* How It Works Guide */}
          <button
            type="button"
            onClick={onOpenHowItWorks}
            className="h-9 flex items-center gap-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Guide</span>
          </button>

          {/* Reset Blocks */}
          <button
            type="button"
            onClick={onReset}
            title="Clear all blocks"
            className="h-9 w-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border border-slate-700 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Direct Send to Channel Button */}
          <button
            type="button"
            disabled={isSending || blockCount === 0 || !selectedChannel}
            onClick={onSend}
            className="col-span-3 sm:col-auto min-w-0 h-9 flex items-center justify-center gap-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
            <span className="truncate">
              {isSending
                ? 'Publishing...'
                : selectedChannel
                ? `Send to ${selectedChannel.title || 'Channel'}`
                : 'Select Channel'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
