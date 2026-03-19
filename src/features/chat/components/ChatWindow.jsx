import React, { useEffect, useMemo, useRef, useState } from 'react';
import Eye from 'lucide-react/dist/esm/icons/eye';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Minus from 'lucide-react/dist/esm/icons/minus';
import Send from 'lucide-react/dist/esm/icons/send';
import X from 'lucide-react/dist/esm/icons/x';
import { useOnlineUsers } from '../../../hooks/useOnlineUsers';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { getSessionUser } from '../../../core/auth/session';
import { useChatContext } from '../ChatContext';
import { useChat } from '../hooks/useChat';

function getInitials(name) {
  const parts = String(name || 'Usuario').trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length > 0 ? parts.map((part) => part[0].toUpperCase()).join('') : 'U';
}

function formatTime(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({
  usuario,
  outroUsuarioId,
  minimizada = false,
  unreadCount = 0,
  isFocused = false,
}) {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const { fecharChat, minimizarChat, focarChat } = useChatContext();
  const {
    mensagens,
    enviarMensagem,
    carregando,
    outroDigitando,
    informarDigitacao,
  } = useChat(outroUsuarioId, isFocused);
  const { onlineUsers } = useOnlineUsers();
  const { theme } = usePersistentTheme();
  const [texto, setTexto] = useState('');
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isOnline = onlineUsers.some((item) => item.auth_user_id === outroUsuarioId);
  const shouldPulse = minimizada && unreadCount > 0;
  const isDark = theme === 'dark';

  useEffect(() => {
    if (minimizada) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [carregando, mensagens, minimizada]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    informarDigitacao(false);
  }, [informarDigitacao]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo) return;

    try {
      informarDigitacao(false);
      focarChat(outroUsuarioId);
      await enviarMensagem(conteudo);
      setTexto('');
    } catch {
      // falha silenciosa para nao quebrar a UI
    }
  };

  return (
    <section
      className={`flex w-full max-w-none flex-col overflow-hidden rounded-[1.35rem] border shadow-[0_24px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:w-[300px] sm:max-w-[300px] ${minimizada ? 'h-12' : 'h-[380px]'} ${
        isDark
          ? shouldPulse
            ? 'border-red-400/60 bg-[#120606]/95 text-white animate-pulse'
            : 'border-white/10 bg-[#080808]/95 text-white'
          : shouldPulse
            ? 'border-red-300 bg-white/95 text-slate-900 ring-2 ring-red-200/80 animate-pulse'
            : 'border-slate-200 bg-white/95 text-slate-900 shadow-xl shadow-slate-200/70'
      }`}
      onMouseDown={() => {
        if (!minimizada) focarChat(outroUsuarioId);
      }}
      onFocusCapture={() => {
        if (!minimizada) focarChat(outroUsuarioId);
      }}
    >
      <header className={`flex h-12 items-center gap-3 px-3 ${
        minimizada ? '' : isDark ? 'border-b border-white/10' : 'border-b border-slate-200'
      } ${shouldPulse ? (isDark ? 'bg-red-500/10' : 'bg-red-50') : ''}`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-[11px] font-black text-white shadow-[0_10px_20px_rgba(220,38,38,0.35)]">
          {getInitials(usuario?.nome)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`truncate text-[13px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{usuario?.nome || 'Usuario'}</p>
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400' : isDark ? 'bg-slate-500' : 'bg-slate-300'}`} />
          </div>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
        {minimizada && unreadCount > 0 && (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <button
          type="button"
          onClick={() => minimizarChat(outroUsuarioId)}
          className={`rounded-xl p-1.5 transition ${
            isDark
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
          aria-label={minimizada ? 'Restaurar conversa' : 'Minimizar conversa'}
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          onClick={() => fecharChat(outroUsuarioId)}
          className={`rounded-xl p-1.5 transition ${
            isDark
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
          aria-label="Fechar conversa"
        >
          <X size={14} />
        </button>
      </header>

      {!minimizada && (
        <>
          <div className={`flex-1 space-y-3 overflow-y-auto px-3 py-3 ${
            isDark
              ? 'bg-gradient-to-b from-white/[0.02] to-transparent'
              : 'bg-gradient-to-b from-red-50/60 via-white to-white'
          }`}>
            {carregando && mensagens.length === 0 ? (
              <div className={`flex h-full items-center justify-center text-center text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Carregando conversa...
              </div>
            ) : mensagens.length === 0 ? (
              <div className={`flex h-full flex-col items-center justify-center gap-2 px-5 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <MessageCircle size={20} className="text-red-400" />
                <p className="text-xs font-semibold">Nenhuma mensagem ainda. Inicie a conversa.</p>
              </div>
            ) : mensagens.map((mensagem) => {
              const enviadaPorMim = mensagem.remetente_id === sessionUser?.auth_user_id;
              return (
                <div key={mensagem.id} className={`flex ${enviadaPorMim ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-3 py-2 ${
                    enviadaPorMim
                      ? 'rounded-br-md bg-gradient-to-br from-red-500 via-rose-500 to-red-700 text-white'
                      : isDark
                        ? 'rounded-bl-md border border-white/10 bg-white/[0.05] text-slate-100'
                        : 'rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800'
                  }`}>
                    <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">{mensagem.conteudo}</p>
                    <div className={`mt-1 flex items-center gap-1 ${
                      enviadaPorMim
                        ? 'justify-end text-white/75'
                        : isDark
                          ? 'justify-start text-slate-400'
                          : 'justify-start text-slate-500'
                    }`}>
                      <p className="text-[10px] font-semibold">
                        {formatTime(mensagem.created_at)}
                      </p>
                      {enviadaPorMim && mensagem.lida && (
                        <Eye size={11} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {outroDigitando && (
              <div className="flex justify-start">
                <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${
                  isDark
                    ? 'border border-white/10 bg-white/[0.05]'
                    : 'border border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-1.5 text-red-400">
                    <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:120ms]" />
                    <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className={`p-3 ${isDark ? 'border-t border-white/10' : 'border-t border-slate-200'}`}>
            <div className={`flex items-end gap-2 rounded-2xl border p-2 ${
              isDark
                ? 'border-white/10 bg-black/20'
                : 'border-slate-200 bg-slate-50'
            }`}>
              <input
                type="text"
                value={texto}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setTexto(nextValue);
                  informarDigitacao(Boolean(nextValue.trim()));

                  if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = window.setTimeout(() => {
                    informarDigitacao(false);
                  }, 1200);
                }}
                placeholder="Digite uma mensagem..."
                className={`h-10 flex-1 bg-transparent px-2 text-sm outline-none ${
                  isDark
                    ? 'text-white placeholder:text-slate-500'
                    : 'text-slate-900 placeholder:text-slate-400'
                }`}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!texto.trim()}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                  texto.trim()
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : isDark
                      ? 'cursor-not-allowed bg-slate-700 text-slate-400'
                      : 'cursor-not-allowed bg-slate-200 text-slate-400'
                }`}
                aria-label="Enviar mensagem"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
