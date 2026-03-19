import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Users from 'lucide-react/dist/esm/icons/users';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import { useChatContext } from '../features/chat/ChatContext';

function normalizeName(value) {
  const text = String(value || '').trim();
  return text || 'Usuario';
}

function normalizeRole(value) {
  const role = String(value || '').trim().toLowerCase();
  if (role === 'técnico' || role === 'tã©cnico') return 'tecnico';
  return role || '';
}

function formatRole(role) {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case 'master':
      return 'Master';
    case 'admin':
      return 'Admin';
    case 'tecnico':
      return 'Tecnico';
    case 'colaborador':
      return 'Colaborador';
    case 'runin_kiosk':
      return 'Runin Kiosk';
    default:
      return '—';
  }
}

function getInitials(name) {
  const parts = normalizeName(name).split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return 'U';
  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

function SupportUserRow({
  user,
  currentUserId,
  isDark,
  online,
  expandable,
  abrirChat,
  unreadCount = 0,
}) {
  const isCurrentUser = currentUserId != null && user?.id === currentUserId;
  const displayName = normalizeName(user?.nome);
  const canChat = !isCurrentUser && Boolean(user?.auth_user_id);

  return (
    <div className={`flex items-center gap-2 py-1.5 ${online ? '' : 'opacity-55'} ${expandable ? 'cursor-default' : ''}`}>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${online ? 'bg-emerald-400' : 'bg-slate-400'}`} />
      <p className={`min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[0.01em] transition-colors duration-200 ${
        online
          ? isDark
            ? 'text-emerald-300'
            : 'text-emerald-700'
          : isDark
            ? 'text-slate-300'
            : 'text-slate-600'
      }`}>
        {displayName}{isCurrentUser ? ' (Voce)' : ''}
      </p>
      <button
        type="button"
        disabled={!canChat}
        onClick={() => {
          if (!canChat) return;
          abrirChat(user);
        }}
        className={`relative inline-flex h-8 w-8 items-center justify-center rounded-xl border transition ${
          canChat
            ? isDark
              ? 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-red-400/40 hover:bg-red-500/10 hover:text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
            : 'cursor-not-allowed border-transparent bg-transparent text-slate-500'
        }`}
        aria-label={canChat ? `Abrir chat com ${displayName}` : `Chat indisponivel para ${displayName}`}
      >
        <MessageCircle size={14} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default function SupportMenuItem({
  currentUser,
  theme = 'dark',
  itemClassName = '',
  panelClassName = '',
  iconSize = 18,
}) {
  const { onlineUsers, offlineUsers, totalOnline } = useOnlineUsers();
  const { abrirChat, naoLidasPorUsuario, totalNaoLidas } = useChatContext();
  const [open, setOpen] = useState(false);
  const [supportsHover, setSupportsHover] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const syncHoverSupport = () => setSupportsHover(mediaQuery.matches);
    syncHoverSupport();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncHoverSupport);
      return () => mediaQuery.removeEventListener('change', syncHoverSupport);
    }

    mediaQuery.addListener(syncHoverSupport);
    return () => mediaQuery.removeListener(syncHoverSupport);
  }, []);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const updateHeight = () => setContentHeight(node.scrollHeight);
    updateHeight();

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [offlineUsers, onlineUsers, open, supportsHover]);

  const resolvedPanelClassName = useMemo(() => (
    panelClassName || (
      isDark
        ? 'ml-3 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]'
        : 'ml-3 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/80'
    )
  ), [isDark, panelClassName]);

  return (
    <div className="relative isolate">
      <style>{`
        @keyframes suporte-pulse {
          0% { opacity: 0.08; transform: scale(1); }
          50% { opacity: 0.18; transform: scale(1.03); }
          100% { opacity: 0.08; transform: scale(1); }
        }
      `}</style>

      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className={`relative z-10 ${itemClassName}`}
        aria-expanded={open}
        aria-label={open ? 'Fechar suporte' : 'Abrir suporte'}
      >
        {!open && (
          <span
            className="absolute inset-0 -z-10 rounded-[inherit] bg-emerald-500/10"
            style={{ animation: 'suporte-pulse 2.8s ease-in-out infinite' }}
            aria-hidden="true"
          />
        )}

        <Users size={iconSize} />
        <span className="flex-1 leading-tight">Suporte</span>
        <span className="ml-auto flex items-center gap-2">
          {totalNaoLidas > 0 && (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white transition-all duration-200">
              {totalNaoLidas > 99 ? '99+' : totalNaoLidas}
            </span>
          )}
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-white">
            {totalOnline}
          </span>
          <ChevronDown size={Math.max(14, iconSize - 2)} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <div
        className={resolvedPanelClassName}
        style={{
          height: open ? `${contentHeight}px` : '0px',
          opacity: open ? 1 : 0,
          transition: 'height 0.25s ease, opacity 0.25s ease',
          overflow: 'visible',
        }}
      >
        <div ref={contentRef} className="overflow-hidden p-3">
          <div className="flex items-center justify-between">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Online
            </p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
              isDark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {totalOnline}
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {onlineUsers.length > 0 ? onlineUsers.map((user) => (
              <SupportUserRow
                key={`online-${user.id ?? user.nome}`}
                user={user}
                currentUserId={currentUser?.id ?? null}
                isDark={isDark}
                online
                expandable={supportsHover}
                abrirChat={abrirChat}
                unreadCount={naoLidasPorUsuario?.[user?.auth_user_id] || 0}
              />
            )) : (
              <p className={`py-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Nenhum usuario online agora.
              </p>
            )}
          </div>

          <div className={`my-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />

          <div className="flex items-center justify-between">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Offline
            </p>
            <span className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {offlineUsers.length}
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {offlineUsers.length > 0 ? offlineUsers.map((user) => (
              <SupportUserRow
                key={`offline-${user.id ?? user.nome}`}
                user={user}
                currentUserId={currentUser?.id ?? null}
                isDark={isDark}
                online={false}
                expandable={supportsHover}
                abrirChat={abrirChat}
                unreadCount={naoLidasPorUsuario?.[user?.auth_user_id] || 0}
              />
            )) : (
              <p className={`py-2 text-sm opacity-50 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Ninguem offline no momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
