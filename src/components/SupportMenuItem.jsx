import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Users from 'lucide-react/dist/esm/icons/users';
import { useOnlineUsers } from '../hooks/useOnlineUsers';

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

function SupportUserRow({ user, currentUserId, isDark, online }) {
  const isCurrentUser = currentUserId != null && user?.id === currentUserId;
  const normalizedRole = normalizeRole(user?.role);
  const roleClass = online && (normalizedRole === 'master' || normalizedRole === 'admin')
    ? 'text-emerald-400'
    : isDark
      ? 'text-slate-400'
      : 'text-slate-500';

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
        isCurrentUser
          ? isDark
            ? 'border-emerald-400/20 bg-emerald-400/10'
            : 'border-emerald-200 bg-emerald-50'
          : isDark
            ? 'border-white/10 bg-white/[0.03]'
            : 'border-slate-200 bg-slate-50/80'
      } ${online ? '' : 'opacity-50'}`}
    >
      <div className="relative shrink-0">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-black ${
          isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-700'
        }`}>
          {getInitials(user?.nome)}
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 ${
          isDark ? 'border-[#080808]' : 'border-white'
        } ${online ? 'bg-emerald-400' : 'bg-slate-400'}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {normalizeName(user?.nome)}
          </p>
          {isCurrentUser && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
              isDark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
            }`}>
              Voce
            </span>
          )}
        </div>
        <p className={`text-xs font-semibold ${roleClass}`}>
          {formatRole(user?.role)}
        </p>
      </div>
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
  const [open, setOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const isDark = theme === 'dark';

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
  }, [onlineUsers, offlineUsers, open]);

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
        onClick={() => setOpen((prev) => !prev)}
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
        }}
      >
        <div ref={contentRef} className="p-3">
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

          <div className="mt-3 space-y-2">
            {onlineUsers.length > 0 ? onlineUsers.map((user) => (
              <SupportUserRow
                key={`online-${user.id ?? user.nome}`}
                user={user}
                currentUserId={currentUser?.id ?? null}
                isDark={isDark}
                online
              />
            )) : (
              <p className={`rounded-2xl border px-3 py-3 text-sm ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
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

          <div className="mt-3 space-y-2">
            {offlineUsers.length > 0 ? offlineUsers.map((user) => (
              <SupportUserRow
                key={`offline-${user.id ?? user.nome}`}
                user={user}
                currentUserId={currentUser?.id ?? null}
                isDark={isDark}
                online={false}
              />
            )) : (
              <p className={`rounded-2xl border px-3 py-3 text-sm opacity-50 ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                Ninguem offline no momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
