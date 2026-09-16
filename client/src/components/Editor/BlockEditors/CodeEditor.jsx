import React from 'react';
import { Code2 } from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript / Node.js' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'json', name: 'JSON' },
  { id: 'sql', name: 'SQL' },
  { id: 'bash', name: 'Bash / Shell' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'plaintext', name: 'Plain Text' }
];

export const CodeEditor = ({ block, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          Code Language
        </span>
        <select
          value={block.language || 'javascript'}
          onChange={(e) => onChange({ ...block, language: e.target.value })}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
      </div>

      <textarea
        rows={4}
        value={block.code || ''}
        onChange={(e) => onChange({ ...block, code: e.target.value })}
        placeholder="// Paste or write your source code here..."
        className="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-emerald-400 rounded-lg p-3 focus:outline-none focus:border-blue-500 leading-relaxed"
      />
    </div>
  );
};
