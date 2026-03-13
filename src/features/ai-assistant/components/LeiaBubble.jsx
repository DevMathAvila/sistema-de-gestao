import React from 'react';
import { Bot, Sparkles, X } from 'lucide-react';

export default function LeiaBubble({ open, onClick, theme }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Fechar chat da Lei.A' : 'Abrir chat da Lei.A'}
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] right-4 z-[80] h-14 w-14 rounded-full transition-transform duration-200 hover:scale-[1.08] focus:outline-none focus:ring-2 focus:ring-red-500/60 sm:bottom-6 sm:right-6 sm:z-[9999] sm:h-16 sm:w-16"
    >
      <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
      <span className={`absolute inset-[6px] rounded-full blur-xl ${isDark ? 'bg-red-500/40' : 'bg-red-400/40'}`} />
      <span className={`relative flex h-full w-full items-center justify-center rounded-full border shadow-[0_16px_40px_rgba(220,38,38,0.38)] ${
        isDark
          ? 'border-red-400/40 bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-white'
          : 'border-red-300 bg-gradient-to-br from-red-500 via-rose-500 to-orange-300 text-white'
      }`}>
        {open ? <X size={22} /> : (
          <span className="relative flex items-center justify-center">
            <Bot size={22} />
            <Sparkles size={12} className="absolute -right-3 -top-2" />
          </span>
        )}
      </span>
    </button>
  );
}
