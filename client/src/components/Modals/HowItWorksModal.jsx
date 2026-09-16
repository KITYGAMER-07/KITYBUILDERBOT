import React from 'react';
import { X, Bot, ShieldCheck, PlusCircle, Send, CheckCircle, ExternalLink } from 'lucide-react';

export const HowItWorksModal = ({
  isOpen,
  onClose,
  botInfo
}) => {
  if (!isOpen) return null;

  const botUsername = botInfo?.username || 'YourBot';
  const addBotLink = `https://t.me/${botUsername}?startchannel=true&admin=post_messages+edit_messages+delete_messages`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Bot className="w-4 h-4 text-blue-400" />
            How to Publish to Your Channel
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bot Highlight Banner */}
        <div className="p-3.5 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Official Publishing Bot
              </div>
              <div className="text-sm font-bold text-white">@{botUsername}</div>
            </div>
          </div>

          <a
            href={addBotLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/30 transition hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add to Channel</span>
          </a>
        </div>

        {/* 3 Step Guide */}
        <div className="space-y-3">
          <div className="flex gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Add Bot as Admin to your Channel</div>
              <div className="text-[11px] text-slate-400">
                Click the "Add to Channel" button above and grant <b>"Post Messages"</b> permission to <b>@{botUsername}</b>.
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Paste Channel Link</div>
              <div className="text-[11px] text-slate-400">
                Type your channel username (e.g. <code>@my_channel</code> or <code>https://t.me/my_channel</code>) in the channel connector box.
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Compose & 1-Click Publish</div>
              <div className="text-[11px] text-slate-400">
                Add Tables, Slideshows, Math, or Buttons in the visual editor and click <b>"Send to Channel"</b>.
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Got it! Let's Start
          </button>
        </div>
      </div>
    </div>
  );
};
