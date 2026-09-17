import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertTriangle, ExternalLink, Shield } from 'lucide-react';

export const SettingsModal = ({
  isOpen,
  onClose,
  botInfo,
  onSaveToken
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setLoading(true);
    setMsg(null);
    const res = await onSaveToken(tokenInput.trim());
    setLoading(false);
    if (res.success) {
      setMsg({ type: 'success', text: `Bot connected: @${res.bot.username}` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to connect bot' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Shield className="w-4 h-4 text-blue-400" />
            Telegram Bot Settings
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Bot Info Banner */}
        {botInfo ? (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              {botInfo.first_name?.charAt(0) || 'B'}
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Bot Connected
              </div>
              <div className="text-xs text-slate-200">@{botInfo.username} ({botInfo.first_name})</div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>No bot token connected. Enter your Bot Token below to activate channel publishing.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              Telegram Bot Token (from @BotFather)
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. 1234567890:ABCdefGhIJKlmNoPQRstuVWXyz..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {msg && (
            <div className={`p-2.5 rounded-lg text-xs font-medium ${
              msg.type === 'success' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
            }`}>
              {msg.text}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Get Token from @BotFather</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
