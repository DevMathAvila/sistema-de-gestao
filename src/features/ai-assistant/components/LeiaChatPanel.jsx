import React, { useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import LeiaMessage from './LeiaMessage';

function LoadingMessage({ theme }) {
  const isDark = theme === 'dark';

  return (
    <div className="flex justify-start">
      <div className={`rounded-2xl px-4 py-3 ${isDark ? 'border border-white/10 bg-white/[0.05]' : 'border border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-1.5 text-red-500">
          <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
          <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:120ms]" />
          <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}

export default function LeiaChatPanel({
  theme,
  loading,
  input,
  messages,
  setInput,
  sendMessage,
  onClose,
}) {
  const bottomRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  return (
    <section className={`fixed bottom-[6.25rem] right-4 z-[9998] flex h-[70vh] w-[calc(100vw-32px)] max-w-[360px] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:right-6 sm:h-[520px] ${
      isDark ? 'border-white/10 bg-[#060606]/92 text-white' : 'border-slate-200 bg-white/95 text-slate-900'
    }`}>
      <header className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-white shadow-[0_10px_24px_rgba(220,38,38,0.28)]">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">Lei.A</p>
              <Sparkles size={12} className="text-red-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                {loading ? 'pensando...' : 'online'}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`rounded-xl p-2 transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
          aria-label="Fechar chat da Lei.A"
        >
          <X size={16} />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <LeiaMessage key={message.id} role={message.role} content={message.content} theme={theme} />
        ))}
        {loading && <LoadingMessage theme={theme} />}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(input);
        }}
        className={`border-t p-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}
      >
        <div className={`flex items-end gap-2 rounded-2xl border p-2 ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={1}
            disabled={loading}
            placeholder="Pergunte algo..."
            className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`flex h-11 min-w-11 items-center justify-center rounded-2xl transition-colors ${
              loading || !input.trim()
                ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </section>
  );
}
