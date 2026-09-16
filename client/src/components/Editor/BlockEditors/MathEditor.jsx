import React from 'react';
import { Pi, Sparkles } from 'lucide-react';

const QUICK_MATH = [
  { label: 'Fraction (a/b)', code: '\\frac{a}{b}' },
  { label: 'Square Root', code: '\\sqrt{x}' },
  { label: 'Sum (Σ)', code: '\\sum_{i=1}^{n}' },
  { label: 'Integral (∫)', code: '\\int_{0}^{\\infty}' },
  { label: 'Limit', code: '\\lim_{x \\to 0}' },
  { label: 'Approx (≈)', code: '\\approx' },
  { label: 'Infinity (∞)', code: '\\infty' },
  { label: 'Alpha (α)', code: '\\alpha' },
  { label: 'Beta (β)', code: '\\beta' },
  { label: 'Delta (Δ)', code: '\\Delta' }
];

export const MathEditor = ({ block, onChange }) => {
  const insertSnippet = (snippet) => {
    const current = block.expression || '';
    onChange({ ...block, expression: current ? `${current} ${snippet}` : snippet });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          <Pi className="w-3.5 h-3.5 text-purple-400" />
          LaTeX Mathematical Formula
        </span>
        <span className="text-[11px] text-slate-500">KaTeX native renderer</span>
      </div>

      {/* Quick Snippets Bar */}
      <div className="flex flex-wrap gap-1">
        {QUICK_MATH.map((m, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => insertSnippet(m.code)}
            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[11px] text-purple-300 font-mono"
          >
            {m.label}
          </button>
        ))}
      </div>

      <textarea
        rows={2}
        value={block.expression || ''}
        onChange={(e) => onChange({ ...block, expression: e.target.value })}
        placeholder="e.g. E = mc^2 \quad \text{or} \quad \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
        className="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-purple-300 rounded-lg p-3 focus:outline-none focus:border-purple-500"
      />
    </div>
  );
};
