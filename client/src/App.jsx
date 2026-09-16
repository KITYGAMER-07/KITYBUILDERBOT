import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChannelSelector } from './components/ChannelSelector';
import { BlockPalette } from './components/BlockPalette';
import { BlockList } from './components/Editor/BlockList';
import { TelegramSimulator } from './components/Preview/TelegramSimulator';
import { HowItWorksModal } from './components/Modals/HowItWorksModal';
import { getTelegramInitData, initTelegramApp, triggerHaptic } from './lib/telegramSdk';
import { uploadToSupabaseSignedUrl } from './lib/supabaseUpload';
import { Edit3, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_CHANNELS_KEY = 'novasp_user_saved_channels';
const MAX_DIRECT_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_SUPABASE_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_TELEGRAM_PHOTO_BYTES = 10 * 1024 * 1024;

export function App() {
  const [blocks, setBlocks] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [botStatus, setBotStatus] = useState({ loading: true, connected: false, bot: null, message: '' });
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('editor');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initialize Telegram SDK, Local Storage & Fetch Bot Status
  useEffect(() => {
    initTelegramApp();
    loadLocalStorageData();
    localStorage.removeItem('novasp_user_saved_templates');
    fetchBotStatus();
  }, []);

  const loadLocalStorageData = () => {
    try {
      const storedChannels = localStorage.getItem(STORAGE_CHANNELS_KEY);
      if (storedChannels) {
        const parsed = JSON.parse(storedChannels);
        setChannels(parsed);
        if (parsed.length > 0) setSelectedChannelId(parsed[0].id);
        refreshSavedChannels(parsed);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  };

  const fetchBotStatus = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch('/api/status', { signal: controller.signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Status request failed.');
      setBotStatus({ ...data, loading: false });
    } catch (e) {
      console.warn('Could not reach backend /api/status:', e);
      setBotStatus({
        loading: false,
        connected: false,
        bot: null,
        message: 'Could not reach the bot service. Check the Vercel deployment and TELEGRAM_BOT_TOKEN.'
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  const refreshSavedChannels = async (savedChannels) => {
    if (!Array.isArray(savedChannels) || savedChannels.length === 0) return;

    const refreshed = await Promise.all(savedChannels.map(async (channel) => {
      try {
        const res = await fetch('/api/channels/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId: channel.id })
        });
        const data = await res.json();
        return data.success && data.channel ? { ...channel, ...data.channel } : channel;
      } catch {
        return channel;
      }
    }));

    setChannels(refreshed);
    localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(refreshed));
  };

  // Verify and Add Channel
  const handleAddChannel = async (channelInput) => {
    try {
      const res = await fetch('/api/channels/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelInput })
      });
      const data = await res.json();

      if (data.success && data.channel) {
        const newChannel = data.channel;
        const updated = [...channels.filter(c => String(c.id) !== String(newChannel.id)), newChannel];
        setChannels(updated);
        setSelectedChannelId(newChannel.id);
        localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(updated));

        showToast(`✅ Connected: "${newChannel.title}"`, 'success');
        triggerHaptic('success');
        return true;
      } else {
        showToast(data.error || 'Verification failed. Make sure Bot is Admin in channel.', 'error');
        triggerHaptic('error');
        return false;
      }
    } catch (e) {
      showToast(`Network Error: ${e.message}`, 'error');
      return false;
    }
  };

  // Disconnect Channel
  const handleDeleteChannel = (channelId) => {
    const updated = channels.filter(c => String(c.id) !== String(channelId));
    setChannels(updated);
    localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(updated));
    if (String(selectedChannelId) === String(channelId)) {
      setSelectedChannelId(updated.length > 0 ? updated[0].id : '');
    }
    showToast('Channel removed from your saved list', 'info');
    triggerHaptic('light');
  };

  // Block Actions
  const handleAddBlock = (newBlock) => {
    setBlocks(prev => [...prev, newBlock]);
    triggerHaptic('light');
    showToast(`Added ${newBlock.type} block`, 'info');
  };

  const handleUpdateBlock = (index, updated) => {
    setBlocks(prev => prev.map((b, i) => (i === index ? updated : b)));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setBlocks(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    triggerHaptic('light');
  };

  const handleMoveDown = (index) => {
    if (index === blocks.length - 1) return;
    setBlocks(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    triggerHaptic('light');
  };

  const handleDuplicate = (index) => {
    const item = blocks[index];
    const clone = {
      ...JSON.parse(JSON.stringify(item)),
      id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    };
    setBlocks(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, clone);
      return copy;
    });
    triggerHaptic('light');
    showToast('Block duplicated', 'info');
  };

  const handleDeleteBlock = (index) => {
    setBlocks(prev => prev.filter((_, i) => i !== index));
    triggerHaptic('light');
  };

  const handleReset = () => {
    if (confirm('Clear all blocks from editor?')) {
      setBlocks([]);
      triggerHaptic('warning');
    }
  };

  // Direct Publish to Selected Channel
  const handlePublish = async () => {
    if (!selectedChannelId) {
      showToast('Please select or connect a channel first!', 'error');
      return;
    }
    if (blocks.length === 0) {
      showToast('Add at least one content block to send!', 'error');
      return;
    }

    setIsSending(true);
    triggerHaptic('impact');

    try {
      const localMedia = [];
      blocks.forEach((block) => {
        if (['photo', 'video', 'animation', 'audio', 'voice'].includes(block.type) && block.localFile) {
          localMedia.push({ file: block.localFile, type: block.type });
        }
        if (['slideshow', 'collage'].includes(block.type)) {
          (block.items || []).forEach((item) => {
            if (item.localFile) localMedia.push({ file: item.localFile, type: item.type || 'photo' });
          });
        }
      });

      const totalUploadBytes = localMedia.reduce((total, media) => total + (media.file.size || 0), 0);
      const oversizedFile = localMedia.find(({ file }) => file.size > MAX_SUPABASE_UPLOAD_BYTES);
      const oversizedPhoto = localMedia.find(({ file, type }) => type === 'photo' && file.size > MAX_TELEGRAM_PHOTO_BYTES);
      if (oversizedFile || totalUploadBytes > MAX_SUPABASE_UPLOAD_BYTES) {
        showToast('Selected media must be 20 MB or smaller in total per post.', 'error');
        triggerHaptic('error');
        return;
      }
      if (oversizedPhoto) {
        showToast('Telegram direct photo uploads support up to 10 MB. Compress this photo and try again.', 'error');
        triggerHaptic('error');
        return;
      }

      const formData = new FormData();
      let uploadIndex = 0;
      let directUploadBytes = 0;

      const uploadLargeMedia = async (file) => {
        const initData = getTelegramInitData();
        const preparedResponse = await fetch('/api/storage/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || 'application/octet-stream',
            size: file.size,
            initData
          })
        });
        const prepared = await preparedResponse.json();
        if (!preparedResponse.ok || !prepared.success) {
          throw new Error(prepared.error || 'Could not prepare the Supabase upload.');
        }
        await uploadToSupabaseSignedUrl({
          bucket: prepared.bucket,
          path: prepared.path,
          token: prepared.token,
          file
        });
        return prepared;
      };

      const prepareMedia = async (media) => {
        const { localFile, localPreviewUrl, fileName, ...cleanMedia } = media;
        if (!localFile) return cleanMedia;

        const canUseDirectUpload = (
          localFile.size <= MAX_DIRECT_UPLOAD_BYTES
          && directUploadBytes + localFile.size <= MAX_DIRECT_UPLOAD_BYTES
        );
        if (canUseDirectUpload) {
          const uploadKey = `media_${uploadIndex++}`;
          directUploadBytes += localFile.size;
          formData.append(uploadKey, localFile, localFile.name || `${uploadKey}.bin`);
          return { ...cleanMedia, url: `attach://${uploadKey}` };
        }

        const stored = await uploadLargeMedia(localFile);
        return {
          ...cleanMedia,
          url: stored.publicUrl,
          storageSource: 'supabase',
          storagePath: stored.path,
          fileName: localFile.name,
          mimeType: localFile.type
        };
      };

      const publishBlocks = [];
      for (const block of blocks) {
        if (['photo', 'video', 'animation', 'audio', 'voice'].includes(block.type)) {
          publishBlocks.push(await prepareMedia(block));
        } else if (['slideshow', 'collage'].includes(block.type)) {
          const { items = [], ...cleanBlock } = block;
          const publishedItems = [];
          for (const item of items) publishedItems.push(await prepareMedia(item));
          publishBlocks.push({ ...cleanBlock, items: publishedItems });
        } else {
          publishBlocks.push(block);
        }
      }

      formData.append('payload', JSON.stringify({
        channelId: selectedChannelId,
        blocks: publishBlocks
      }));

      const res = await fetch('/api/send', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        triggerHaptic('success');
        showToast(
          data.fallback
            ? `Sent as standard Telegram media: ${data.warning || 'the rich-media URL was rejected.'}`
            : '🎉 Rich message successfully posted to channel!',
          data.fallback ? 'info' : 'success'
        );
      } else {
        triggerHaptic('error');
        showToast(`Failed: ${data.error || 'Check bot permissions'}`, 'error');
      }
    } catch (e) {
      triggerHaptic('error');
      showToast(`Error: ${e.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const selectedChannel = channels.find(c => String(c.id) === String(selectedChannelId)) || channels[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-16 left-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold backdrop-blur-md border animate-bounce transition bg-slate-900/95 border-slate-700 text-white">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-blue-400" />
          )}
          <span className="break-words">{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        botStatus={botStatus}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onReset={handleReset}
        onSend={handlePublish}
        isSending={isSending}
        selectedChannel={selectedChannel}
        blockCount={blocks.length}
      />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-slate-800 bg-slate-900 px-4 py-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
            activeMobileTab === 'editor'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-800'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor ({blocks.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
            activeMobileTab === 'preview'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Visual Editor & Palette */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            activeMobileTab === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Target Channel Connector */}
          <ChannelSelector
            channels={channels}
            selectedChannelId={selectedChannelId}
            onSelectChannel={setSelectedChannelId}
            onAddChannel={handleAddChannel}
            onDeleteChannel={handleDeleteChannel}
            botInfo={botStatus?.bot}
          />

          {/* Block Palette (Add Blocks) */}
          <BlockPalette onAddBlock={handleAddBlock} />

          {/* Block List Workspace */}
          <div className="space-y-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold uppercase tracking-wider">
                Post Content Structure ({blocks.length} Blocks)
              </span>
              <span className="text-[11px] text-slate-500">Drag / Reorder anytime</span>
            </div>

            <BlockList
              blocks={blocks}
              onUpdateBlock={handleUpdateBlock}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteBlock}
            />
          </div>
        </div>

        {/* Right Column: Live Telegram Simulator */}
        <div
          className={`lg:col-span-5 h-[calc(100dvh-156px)] lg:h-[calc(100vh-100px)] lg:sticky lg:top-20 ${
            activeMobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <TelegramSimulator
            blocks={blocks}
            channel={selectedChannel || { title: 'Your Channel', username: 'channel' }}
            onToast={(msg) => showToast(msg, 'info')}
          />
        </div>
      </main>

      {/* How It Works Guide Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        botInfo={botStatus?.bot}
      />

    </div>
  );
}
