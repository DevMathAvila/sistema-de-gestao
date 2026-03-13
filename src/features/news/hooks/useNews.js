import { useCallback, useEffect, useMemo, useState } from 'react';
import { NEWS_DATA, NEWS_VERSION_LATEST } from '../constants/newsData';

function getStorageKey(userId) {
  return `lenovo_news_seen_${userId || 'anon'}`;
}

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
  const storageKey = useMemo(() => getStorageKey(userId), [userId]);
  const [seenVersion, setSeenVersion] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      setSeenVersion(localStorage.getItem(storageKey) || null);
    } catch {
      setSeenVersion(null);
    }
  }, [storageKey]);

  const markAsRead = useCallback((version = NEWS_VERSION_LATEST) => {
    try {
      localStorage.setItem(storageKey, version);
      setSeenVersion(version);
    } catch {
      setSeenVersion(version);
    }
  }, [storageKey]);

  const hasUnread = compareVersions(NEWS_VERSION_LATEST, seenVersion) > 0;

  return {
    hasUnread,
    latestVersion: NEWS_VERSION_LATEST,
    latestNews: NEWS_DATA[0] || null,
    markAsRead,
    seenVersion,
  };
}
