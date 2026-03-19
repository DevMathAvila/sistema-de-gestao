import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/core/api/supabaseClient';
import { NEWS_DATA, NEWS_VERSION_LATEST } from '../constants/newsData';

export function compareVersions(a, b) {
  const aParts = String(a || '0.0.0').split('.').map((item) => Number(item) || 0);
  const bParts = String(b || '0.0.0').split('.').map((item) => Number(item) || 0);
  const size = Math.max(aParts.length, bParts.length);

  for (let index = 0; index < size; index += 1) {
    const left = aParts[index] || 0;
    const right = bParts[index] || 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }

  return 0;
}

export function useNews(userId) {
  const [seenVersion, setSeenVersion] = useState(null);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    let active = true;

    async function loadSeenVersion() {
      if (!userId) {
        setSeenVersion(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('news_seen_version')
          .eq('id', userId)
          .maybeSingle();

        if (!active) return;
        if (error) throw error;

        setSeenVersion(String(data?.news_seen_version || '').trim() || null);
      } catch {
        if (!active) return;
        setSeenVersion(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSeenVersion();

    return () => {
      active = false;
    };
  }, [userId]);

  const markAsRead = useCallback(async (version = NEWS_VERSION_LATEST) => {
    const normalizedVersion = String(version || NEWS_VERSION_LATEST).trim() || NEWS_VERSION_LATEST;
    const previousVersion = seenVersion;
    setSeenVersion(normalizedVersion);

    if (!userId) return;

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const accessToken = String(session?.access_token || '').trim();
      if (!accessToken) throw new Error('Sessao expirada.');

      const { error } = await supabase.functions.invoke('user-mark-news-seen', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: { version: normalizedVersion },
      });

      if (error) throw error;
    } catch {
      setSeenVersion(previousVersion);
    }
  }, [seenVersion, userId]);

  const hasUnread = compareVersions(NEWS_VERSION_LATEST, seenVersion) > 0;

  return {
    loading,
    hasUnread,
    latestVersion: NEWS_VERSION_LATEST,
    latestNews: NEWS_DATA[0] || null,
    markAsRead,
    seenVersion,
  };
}
