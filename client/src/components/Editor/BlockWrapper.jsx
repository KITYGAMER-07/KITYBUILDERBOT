import React, { useState } from 'react';
import {
  ChevronUp, ChevronDown, Copy, Trash2, ChevronRight,
  GripVertical, Type, Table, List, ChevronDownSquare,
  Quote, Code2, Pi, Layers, LayoutGrid, Image, Video,
  Sparkles, Music, Mic, MapPin, MousePointerClick, Minus, Bookmark
} from 'lucide-react';

const BLOCK_META = {
  heading: { label: 'Section Heading', icon: Type, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  paragraph: { label: 'Text Paragraph', icon: Type, color: 'text-slate-300 bg-slate-500/10 border-slate-500/30' },
  table: { label: 'Table (Grid)', icon: Table, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  list: { label: 'List / Checklist', icon: List, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  details: { label: 'Fold / Accordion', icon: ChevronDownSquare, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  blockquote: { label: 'Blockquote', icon: Quote, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  pullquote: { label: 'Pull Quote (Callout)', icon: Quote, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  code: { label: 'Preformatted Code', icon: Code2, color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
  math: { label: 'LaTeX Math Formula', icon: Pi, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  slideshow: { label: 'Slideshow Carousel', icon: Layers, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  collage: { label: 'Collage Grid', icon: LayoutGrid, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  photo: { label: 'Photo', icon: Image, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  video: { label: 'Video', icon: Video, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  animation: { label: 'GIF Animation', icon: Sparkles, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  audio: { label: 'Audio / Music', icon: Music, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  voice: { label: 'Voice Note', icon: Mic, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  map: { label: 'Map Location', icon: MapPin, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' },
  buttons: { label: 'In-Body Buttons', icon: MousePointerClick, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  divider: { label: 'Divider Line', icon: Minus, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
  anchor: { label: 'Anchor Bookmark', icon: Bookmark, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  footer: { label: 'Footer Note', icon: Type, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' }
};

export const BlockWrapper = ({
  block,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const meta = BLOCK_META[block.type] || { label: block.type, icon: Type, color: 'text-slate-400 bg-slate-800' };
  const Icon = meta.icon;

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm transition hover:border-slate-600">
      {/* Block Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-0.5"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${meta.color}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{meta.label}</span>
          </div>

          <span className="text-[11px] font-mono text-slate-500">#{index + 1}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            title="Move Up"
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-800"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            title="Move Down"
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-800"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate Block"
            className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete Block"
            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block Content Editor */}
      {!collapsed && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  );
};
