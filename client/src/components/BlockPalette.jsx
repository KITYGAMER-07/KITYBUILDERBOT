import React, { useState } from 'react';
import {
  Type, AlignLeft, Table, List, ChevronDownSquare, Quote,
  Code2, Pi, Layers, LayoutGrid, Image, Video,
  Music, Mic, MapPin, MousePointerClick, Minus, Bookmark,
  Plus
} from 'lucide-react';

const BLOCK_TYPES = [
  {
    category: 'Text & Structure',
    items: [
      { type: 'heading', label: 'Heading', icon: Type, color: 'text-blue-400', defaultData: { level: 1, text: 'New Section Title' } },
      { type: 'paragraph', label: 'Paragraph', icon: AlignLeft, color: 'text-slate-200', defaultData: { text: 'Enter your rich message text here...' } },
      { type: 'footer', label: 'Footer Note', icon: AlignLeft, color: 'text-slate-400', defaultData: { text: '© 2026 KITY RICH STUDIO. All rights reserved.' } },
      { type: 'divider', label: 'Divider Line', icon: Minus, color: 'text-slate-500', defaultData: {} },
      { type: 'anchor', label: 'Anchor Bookmark', icon: Bookmark, color: 'text-indigo-400', defaultData: { name: 'section_1' } }
    ]
  },
  {
    category: 'Structured & Foldable',
    items: [
      { type: 'table', label: 'Table (Grid)', icon: Table, color: 'text-emerald-400', defaultData: { headers: ['Feature', 'Plan A', 'Plan B'], rows: [['Latency', '10ms', '50ms'], ['Support', '24/7', 'Email']] } },
      { type: 'list', label: 'Lists & Checklists', icon: List, color: 'text-amber-400', defaultData: { listType: 'checklist', items: [{ text: 'Item 1', checked: true }, { text: 'Item 2', checked: false }] } },
      { type: 'details', label: 'Fold / Accordion', icon: ChevronDownSquare, color: 'text-cyan-400', defaultData: { title: '📖 Read More (Click to expand)', content: 'Hidden details revealed upon clicking.' } },
      { type: 'blockquote', label: 'Blockquote', icon: Quote, color: 'text-sky-400', defaultData: { text: 'This is a quotation highlight.', expandable: false } },
      { type: 'pullquote', label: 'Pull Quote (Callout)', icon: Quote, color: 'text-pink-400', defaultData: { text: 'A powerful high-impact statement to feature.', author: 'Author Name' } }
    ]
  },
  {
    category: 'Code & Math',
    items: [
      { type: 'code', label: 'Code Block', icon: Code2, color: 'text-emerald-300', defaultData: { language: 'javascript', code: '// Code snippet\nconsole.log("Hello from Telegram Bot!");' } },
      { type: 'math', label: 'LaTeX Math Formula', icon: Pi, color: 'text-purple-400', defaultData: { expression: 'E = mc^2 \\quad \\text{or} \\quad \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' } }
    ]
  },
  {
    category: 'Visual & Media Carousel',
    items: [
      { type: 'slideshow', label: 'Slideshow Carousel', icon: Layers, color: 'text-blue-400', defaultData: { items: [{ url: '', caption: '' }] } },
      { type: 'collage', label: 'Collage Grid', icon: LayoutGrid, color: 'text-teal-400', defaultData: { items: [{ url: '', caption: '' }] } },
      { type: 'photo', label: 'Photo', icon: Image, color: 'text-sky-400', defaultData: { url: '', caption: '' } },
      { type: 'video', label: 'Video', icon: Video, color: 'text-rose-400', defaultData: { url: '', caption: '' } },
      { type: 'animation', label: 'GIF Animation', icon: Image, color: 'text-amber-400', defaultData: { url: '', caption: '' } },
      { type: 'audio', label: 'Audio / Music', icon: Music, color: 'text-indigo-400', defaultData: { url: '', title: '', performer: '' } },
      { type: 'voice', label: 'Voice Note', icon: Mic, color: 'text-red-400', defaultData: { url: '', duration: 0 } }
    ]
  },
  {
    category: 'Location & Interactive',
    items: [
      { type: 'map', label: 'Map Location', icon: MapPin, color: 'text-rose-500', defaultData: { latitude: 12.9716, longitude: 77.5946, title: 'Bangalore City Center' } },
      { type: 'buttons', label: 'Interactive Buttons', icon: MousePointerClick, color: 'text-blue-400', defaultData: { buttons: [[{ text: '🌐 Visit Website', type: 'url', url: 'https://telegram.org' }, { text: '📱 Mini App', type: 'webapp', url: 'https://telegram.org' }]] } }
    ]
  }
];

export const BlockPalette = ({ onAddBlock }) => {
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', ...BLOCK_TYPES.map(b => b.category)];

  const filtered = activeTab === 'All'
    ? BLOCK_TYPES
    : BLOCK_TYPES.filter(b => b.category === activeTab);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Plus className="w-4 h-4 text-blue-500" />
          Add Rich Blocks
        </div>
        <span className="text-[11px] text-slate-500">18+ Telegram Blocks</span>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveTab(cat)}
            className={`px-2 py-0.5 text-[11px] font-medium rounded-full transition-colors ${
              activeTab === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Block Items Grid */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {filtered.map((catGroup) => (
          <div key={catGroup.category} className="space-y-1.5">
            {activeTab === 'All' && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {catGroup.category}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {catGroup.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type + item.label}
                    type="button"
                    onClick={() => onAddBlock({ type: item.type, id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...item.defaultData })}
                    className="flex items-center gap-2 p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-blue-500/50 rounded-lg text-left transition group"
                  >
                    <Icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
