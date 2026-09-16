import React, { useState } from 'react';
import { X, Bookmark, Download, Plus, Trash2, FileText } from 'lucide-react';
import { sampleTemplates } from '../../lib/sampleTemplates';

export const TemplateModal = ({
  isOpen,
  onClose,
  currentBlocks,
  savedTemplates = [],
  onLoadTemplate,
  onSaveTemplate,
  onDeleteTemplate
}) => {
  const [templateName, setTemplateName] = useState('');
  const [activeTab, setActiveTab] = useState('samples'); // 'samples' | 'saved'

  if (!isOpen) return null;

  const handleSaveCurrent = (e) => {
    e.preventDefault();
    if (!templateName.trim()) return;
    onSaveTemplate({
      name: templateName.trim(),
      blocks: currentBlocks
    });
    setTemplateName('');
    setActiveTab('saved');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Bookmark className="w-4 h-4 text-blue-400" />
            Rich Message Templates Library
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('samples')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'samples'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Featured Samples ({sampleTemplates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            My Saved Drafts ({savedTemplates.length})
          </button>
        </div>

        {/* Samples List */}
        {activeTab === 'samples' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sampleTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-white">{tpl.name}</div>
                  <div className="text-[11px] text-slate-400">{tpl.category} • {tpl.blocks.length} Blocks</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLoadTemplate(tpl.blocks);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" /> Load
                </button>
              </div>
            ))}
          </div>
        )}

        {/* User Saved Templates */}
        {activeTab === 'saved' && (
          <div className="space-y-3">
            {/* Save Current Box */}
            <form onSubmit={handleSaveCurrent} className="flex gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Save current post as template name..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!templateName.trim()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Save
              </button>
            </form>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {savedTemplates.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No saved templates yet. Save your current post layout above!
                </div>
              ) : (
                savedTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{tpl.name}</div>
                      <div className="text-[11px] text-slate-400">{tpl.blocks?.length || 0} Blocks</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadTemplate(tpl.blocks);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                      >
                        <Download className="w-3 h-3" /> Load
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTemplate(tpl.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
