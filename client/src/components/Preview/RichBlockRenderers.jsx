import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import {
  ChevronLeft, ChevronRight, Copy, Check, ChevronDown,
  Play, Pause, Mic, MapPin, Volume2, Globe, ExternalLink,
  AppWindow, Share2
} from 'lucide-react';

/* 1. Math Renderer with KaTeX */
export const MathBlockRenderer = ({ expression }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && expression) {
      try {
        katex.render(expression, containerRef.current, {
          displayMode: true,
          throwOnError: false
        });
      } catch (e) {
        containerRef.current.innerText = expression;
      }
    }
  }, [expression]);

  return (
    <div className="my-2 p-2.5 bg-[#17212b]/90 dark:bg-[#17212b] border border-blue-500/20 rounded-lg overflow-x-auto text-center text-blue-300">
      <div ref={containerRef} className="katex-container font-serif text-sm"></div>
    </div>
  );
};

/* 2. Code Block Renderer with Prism & Copy Button */
export const CodeBlockRenderer = ({ code, language = 'javascript' }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-lg bg-[#0e1621] border border-slate-700/60 overflow-hidden font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#17212b] border-b border-slate-800 text-[11px] text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-slate-300">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-emerald-400 leading-relaxed m-0">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

/* 3. Slideshow Carousel Renderer */
export const SlideshowRenderer = ({ items = [] }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!items || items.length === 0) return null;
  const current = items[currentIdx] || items[0];

  return (
    <div className="my-2 rounded-xl overflow-hidden bg-black/40 border border-slate-700/50 shadow-md relative group">
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {current.localPreviewUrl || current.url ? (
          <img
            src={current.localPreviewUrl || current.url}
            alt={current.caption || 'Slide'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-xs text-slate-500">No Image URL</div>
        )}

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => (prev === 0 ? items.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => (prev === items.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Slide Counter Badge */}
        {items.length > 1 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 rounded-full text-[10px] font-bold text-white tracking-wider">
            {currentIdx + 1}/{items.length}
          </div>
        )}
      </div>

      {/* Caption & Indicator Dots */}
      <div className="p-2.5 bg-[#182533] space-y-1.5">
        {current.caption && (
          <p className="text-xs text-slate-200 font-medium">{current.caption}</p>
        )}
        {items.length > 1 && (
          <div className="flex justify-center gap-1 pt-1">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIdx ? 'w-4 bg-blue-400' : 'w-1.5 bg-slate-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* 4. Collage Grid Renderer */
export const CollageRenderer = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`my-2 grid gap-1 rounded-xl overflow-hidden ${
      items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
    }`}>
      {items.map((it, idx) => (
        <div key={idx} className="aspect-square bg-slate-900 relative overflow-hidden">
          {it.localPreviewUrl || it.url ? (
            <img src={it.localPreviewUrl || it.url} alt={`Collage ${idx}`} className="w-full h-full object-cover hover:scale-105 transition" />
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] text-slate-600">Image</div>
          )}
        </div>
      ))}
    </div>
  );
};

/* 5. Fold / Accordion (Details) Renderer */
export const DetailsRenderer = ({ title, content }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-2 border border-slate-700/80 bg-[#182533]/80 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold text-blue-300 hover:bg-slate-800/50 transition"
      >
        <span>{title || 'Click to expand'}</span>
        <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="p-3 pt-1 text-xs text-slate-300 border-t border-slate-700/40 bg-[#0e1621]/50 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );
};

/* 6. Table Renderer */
export const TableRenderer = ({ headers = [], rows = [] }) => {
  return (
    <div className="my-2 overflow-x-auto rounded-lg border border-slate-700 bg-[#17212b]">
      <table className="w-full text-xs text-left border-collapse">
        {headers.length > 0 && (
          <thead className="bg-[#242f3d] text-slate-200 border-b border-slate-700">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="px-3 py-2 font-bold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-800">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-800/40 transition">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-slate-300 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* 7. Voice Note Player Mockup */
export const VoiceNoteRenderer = ({ duration = 15, caption }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="my-2 p-2.5 bg-[#2b5278] rounded-2xl max-w-xs space-y-1.5 shadow-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="w-10 h-10 rounded-full bg-white text-[#2b5278] flex items-center justify-center shadow hover:scale-105 transition"
        >
          {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Waveform graphic bars */}
        <div className="flex-1 flex items-center gap-0.5 h-6">
          {[30, 60, 40, 90, 75, 45, 100, 65, 80, 50, 70, 95, 40, 60, 85, 55, 35, 75, 45, 90].map((h, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full ${idx < 8 && playing ? 'bg-white' : 'bg-white/60'}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <span className="text-[11px] font-mono text-white/90">0:{String(duration).padStart(2, '0')}</span>
      </div>
      {caption && <p className="text-[11px] text-white/80 pl-1">{caption}</p>}
    </div>
  );
};

/* 8. Map Location Embed Renderer */
export const MapRenderer = ({ latitude = 12.9716, longitude = 77.5946, title = 'Location' }) => {
  return (
    <a
      href={`https://maps.google.com/?q=${latitude},${longitude}`}
      target="_blank"
      rel="noreferrer"
      className="my-2 block rounded-xl overflow-hidden border border-slate-700 bg-[#182533] hover:border-blue-500 transition group shadow"
    >
      <div className="h-28 bg-slate-900 relative flex items-center justify-center overflow-hidden">
        {/* Map Grid Background pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 flex flex-col items-center gap-1 group-hover:scale-110 transition-transform">
          <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
            <MapPin className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        </div>
      </div>
      <div className="p-2.5 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            {title}
          </div>
          <div className="text-[10px] text-slate-400">Click to open Google Maps</div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
      </div>
    </a>
  );
};

/* 9. Interactive Buttons Grid */
export const ButtonsRenderer = ({ buttons = [], onToast }) => {
  if (!buttons || buttons.length === 0) return null;

  const handleClick = (btn) => {
    if (btn.type === 'copy_text') {
      const copyVal = btn.text_to_copy || btn.text;
      navigator.clipboard.writeText(copyVal);
      if (onToast) onToast(`Copied to clipboard: "${copyVal}"`);
    } else if (btn.url) {
      window.open(btn.url, '_blank');
    }
  };

  return (
    <div className="mt-3 space-y-1.5">
      {buttons.map((row, rIdx) => (
        <div key={rIdx} className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-1.5">
          {row.map((btn, bIdx) => (
            <button
              key={bIdx}
              type="button"
              onClick={() => handleClick(btn)}
              className="min-h-10 py-2 px-3 bg-[#2b5278] hover:bg-[#34628f] active:bg-[#204060] text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center gap-1.5 text-center break-words"
            >
              {btn.type === 'webapp' && <AppWindow className="w-3.5 h-3.5" />}
              {btn.type === 'copy_text' && <Copy className="w-3.5 h-3.5" />}
              {btn.type === 'switch_inline_query' && <Share2 className="w-3.5 h-3.5" />}
              <span className="break-words">{btn.text || 'Button'}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
