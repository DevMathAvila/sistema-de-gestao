import React, { useEffect, useMemo, useState } from 'react';
import { PartyPopper, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePersistentTheme } from '@/shared/hooks/usePersistentTheme';
import { compareVersions, useNews } from '../hooks/useNews';

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export default function NewsPopup({ userId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = usePersistentTheme();
  const { hasUnread, latestNews, markAsRead, seenVersion } = useNews(userId);
  const [visible, setVisible] = useState(false);

  const hasContent = useMemo(() => Boolean(latestNews?.title && latestNews?.summary), [latestNews]);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!hasUnread || !hasContent) return undefined;
    const timer = window.setTimeout(() => setVisible(true), 1400);
    return () => window.clearTimeout(timer);
  }, [hasContent, hasUnread]);

  useEffect(() => {
    const checkRemoteVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        const remoteVersion = String(payload?.version || '').trim();
        if (!remoteVersion) return;
        const lastSeen = seenVersion || '0.0.0';
        if (compareVersions(remoteVersion, lastSeen) > 0) {
          setVisible(true);
        }
      } catch {
        // polling best-effort
      }
    };

    const interval = window.setInterval(checkRemoteVersion, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [seenVersion]);

  if (!visible || !hasContent) return null;

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Fechar popup de novidades"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={() => setVisible(false)}
      />
      <div className={`relative w-[calc(100vw-32px)] max-w-md rounded-[2rem] border p-5 shadow-[0_30px_90px_rgba(15,23,42,0.35)] sm:p-6 ${
        isDark ? 'border-white/10 bg-[#070707] text-white' : 'border-slate-200 bg-white text-slate-900'
      }`}>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className={`absolute right-4 top-4 rounded-xl p-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-white">
            <PartyPopper size={20} />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-red-500">Opa, surgiu novidade!</p>
        </div>

        <h3 className="mt-5 text-2xl font-black leading-tight">{latestNews.title}</h3>
        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {latestNews.summary}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => {
              markAsRead();
              setVisible(false);
              if (location.pathname === '/dashboard') {
                document.getElementById('lenovo-news-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
              }
              navigate('/novidades');
            }}
            className="min-h-11 rounded-xl bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700"
          >
            Ver novidades
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className={`min-h-11 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-slate-200 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Agora nao
          </button>
        </div>
      </div>
    </div>
  );
}
