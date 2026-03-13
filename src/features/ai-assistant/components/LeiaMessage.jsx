import React from 'react';

export default function LeiaMessage({ role, content, theme }) {
  const isUser = role === 'user';
  const isDark = theme === 'dark';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-[0_10px_24px_rgba(220,38,38,0.28)]'
          : isDark
            ? 'border border-white/10 bg-white/[0.05] text-white'
            : 'border border-slate-200 bg-white text-slate-900'
      }`}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
