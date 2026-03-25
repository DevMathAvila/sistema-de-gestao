import React, { useEffect, useMemo, useState } from 'react';
import { PartyPopper, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePersistentTheme } from '@/shared/hooks/usePersistentTheme';
import { compareVersions, useNews } from '../hooks/useNews';

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const AUTO_CLOSE_MS = 5 * 1000;
const displayedVersionsByUser = new Map();

export default function NewsPopup({ userId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = usePersistentTheme();
  const { hasUnread, latestNews, markAsRead, seenVersion, loading } = useNews(userId);
  const [visible, setVisible] = useState(false);
  const [dismissedVersion, setDismissedVersion] = useState(null);

  const hasContent = useMemo(() => Boolean(latestNews?.title && latestNews?.summary), [latestNews]);
  const latestVersion = String(latestNews?.version || '').trim();
  const isDark = theme === 'dark';
  const displayedVersion = userId ? displayedVersionsByUser.get(userId) || null : null;

  useEffect(() => {
    if (loading || !hasUnread || !hasContent || !latestVersion || dismissedVersion === latestVersion || displayedVersion === latestVersion) return undefined;
    const timer = window.setTimeout(() => setVisible(true), 1400);
    return () => window.clearTimeout(timer);
  }, [dismissedVersion, displayedVersion, hasContent, hasUnread, latestVersion, loading]);

  useEffect(() => {
    if (!visible || !latestVersion) return undefined;
    const timer = window.setTimeout(() => {
      closeAndMarkAsRead(latestVersion);
    }, AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [latestVersion, visible]);

  useEffect(() => {
    if (!latestVersion) return;
    if (seenVersion === latestVersion) {
      if (userId) displayedVersionsByUser.set(userId, latestVersion);
      setDismissedVersion(latestVersion);
      setVisible(false);
    }
  }, [latestVersion, seenVersion, userId]);

  const closeAndMarkAsRead = async (version = latestVersion) => {
    if (!version) {
      setVisible(false);
      return;
    }

    if (userId) displayedVersionsByUser.set(userId, version);
    setDismissedVersion(version);
    setVisible(false);
    await markAsRead(version);
  };

  useEffect(() => {
    const checkRemoteVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        const remoteVersion = String(payload?.version || '').trim();
        if (!remoteVersion) return;
        const lastSeen = seenVersion || '0.0.0';
        const alreadyDisplayed = userId ? displayedVersionsByUser.get(userId) === remoteVersion : false;
        if (compareVersions(remoteVersion, lastSeen) > 0 && !alreadyDisplayed) {
          setVisible(true);
        }
      } catch {
        // polling best-effort
      }
    };

    const interval = window.setInterval(checkRemoteVersion, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [seenVersion, userId]);

  if (!visible || !hasContent) return null;

  return (
    <div className="fixed right-3 top-3 z-[9997] w-[calc(100vw-24px)] max-w-sm sm:right-5 sm:top-5 sm:w-full">
      <div className={`relative overflow-hidden rounded-[1.75rem] border p-4 shadow-[0_24px_60px_rgba(15,23,42,0.24)] sm:p-5 ${
        isDark ? 'border-white/10 bg-[#070707] text-white' : 'border-slate-200 bg-white text-slate-900'
      }`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-red-500 via-rose-500 to-orange-400" />
        <button
          type="button"
          onClick={() => {
            closeAndMarkAsRead();
          }}
          className={`absolute right-3 top-3 rounded-xl p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-3 pr-8">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-white shadow-lg shadow-red-500/20">
            <PartyPopper size={18} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">Nova atualizacao</p>
            <h3 className="mt-1 text-lg font-black leading-tight">{latestNews.title}</h3>
          </div>
        </div>

        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {latestNews.summary}
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={async () => {
              await closeAndMarkAsRead(latestVersion);
              if (location.pathname === '/dashboard') {
                document.getElementById('lenovo-news-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
              }
              navigate('/novidades');
            }}
            className="min-h-10 rounded-xl bg-red-600 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-700"
          >
            Ver mais
          </button>
          <button
            type="button"
            onClick={async () => {
              await closeAndMarkAsRead(latestVersion);
            }}
            className={`min-h-10 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-200 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Ver depois
          </button>
        </div>
      </div>
    </div>
  );
}
