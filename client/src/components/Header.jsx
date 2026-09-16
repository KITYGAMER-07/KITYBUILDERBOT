import React from 'react';
import {
  Send, Sparkles, HelpCircle, Bookmark, Trash2,
  CheckCircle, PlusCircle, ExternalLink
} from 'lucide-react';

export const Header = ({
  botStatus,
  onOpenHowItWorks,
  onOpenTemplates,
  onReset,
  onSend,
  isSending,
  selectedChannel,
  blockCount
}) => {
  const botUsername = botStatus?.bot?.username || 'NovaBot';
  const addBotLink = `https://t.me/${botUsername}?startchannel=true&admin=post_messages+edit_messages+delete_messages`;

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                NovaEsp Rich Studio
              </h1>
              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold">
                API 10.x
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Telegram Rich Message Builder & Multi-Channel Publisher
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Bot Status & Add Bot Quick Button */}
          {botStatus?.connected ? (
            <a
              href={addBotLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40 rounded-lg text-xs font-semibold transition"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>@{botUsername}</span>
              <PlusCircle className="w-3.5 h-3.5 text-blue-400 ml-0.5" />
            </a>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Checking Bot Status...</span>
            </div>
          )}

          {/* How It Works Guide */}
          <button
            type="button"
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Guide</span>
          </button>

          {/* Templates Library */}
          <button
            type="button"
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Templates</span>
          </button>

          {/* Reset Blocks */}
          <button
            type="button"
            onClick={onReset}
            title="Clear all blocks"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border border-slate-700 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Direct Send to Channel Button */}
          <button
            type="button"
            disabled={isSending || blockCount === 0 || !selectedChannel}
            onClick={onSend}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
            <span>
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
