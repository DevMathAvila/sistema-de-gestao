import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, X } from 'lucide-react';
import { TYPE_META } from '../constants/newsMeta';

export default function NewsDetailModal({ newsItem, theme, onClose }) {
  if (!newsItem) return null;

  const meta = TYPE_META[newsItem.type] || TYPE_META.feature;

  return (
    <div className="fixed inset-0 z-[9996] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar detalhes da novidade"
      />
      <div className={`relative h-auto max-h-[85vh] w-[calc(100vw-32px)] max-w-4xl overflow-y-auto rounded-[2rem] border p-5 shadow-[0_30px_90px_rgba(15,23,42,0.35)] sm:p-6 md:p-8 ${theme === 'dark' ? 'border-white/10 bg-[#080808] text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-4 top-4 min-h-11 min-w-11 rounded-xl p-2 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
        >
          <X size={16} />
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">v{newsItem.version}</span>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${meta.pill}`}>
            {meta.label}
          </span>
        </div>
        <h3 className="mt-5 pr-12 text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">{newsItem.title}</h3>
        <div className={`mt-5 rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50'}`}>
          <p className="text-sm leading-6">{newsItem.summary}</p>
        </div>
        <div className={`prose mt-6 max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
          <ReactMarkdown>{newsItem.details}</ReactMarkdown>
        </div>
        <div className="mt-6 space-y-3">
          {newsItem.items.map((entry) => (
            <div key={entry} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Check size={14} />
              </span>
              <p className="text-sm">{entry}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
