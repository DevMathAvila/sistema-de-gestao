import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../core/api/supabaseClient';
import { getSessionUser } from '../core/auth/session';
import { listarUsuarios } from '../core/api/supabaseSecure';

const CHANNEL_NAME = 'sistema_online';
const RECONNECT_DELAY_MS = 1200;
const PRESENCE_HEALTHCHECK_MS = 15000;

const sharedState = {
  currentUserKey: '',
  currentUser: null,
  refCount: 0,
  channel: null,
  reconnectTimeout: null,
  healthcheckInterval: null,
  subscriptionStatus: 'closed',
  allUsers: [],
  onlineUsers: [],
  listeners: new Set(),
  presenceUnavailable: false,
};

function normalizeName(value) {
  const text = String(value || '').trim();
  return text || 'Usuario';
}

function normalizeRole(value) {
  const role = String(value || '').trim().toLowerCase();
  if (role === 'técnico' || role === 'tã©cnico') return 'tecnico';
  return role || '—';
}

function normalizeAuthUserId(value) {
  const authUserId = String(value || '').trim();
  return authUserId || null;
}

function getCurrentSnapshot() {
  const onlineIds = new Set(sharedState.onlineUsers.map((item) => item.id).filter((id) => id != null));
  const offlineUsers = sharedState.presenceUnavailable
    ? []
    : [...sharedState.allUsers]
        .filter((item) => item.id == null || !onlineIds.has(item.id))
        .sort((a, b) => normalizeName(a.nome).localeCompare(normalizeName(b.nome), 'pt-BR', { sensitivity: 'base' }));

  return {
    onlineUsers: sharedState.presenceUnavailable ? [] : sharedState.onlineUsers,
    offlineUsers,
    totalOnline: sharedState.presenceUnavailable ? 0 : sharedState.onlineUsers.length,
  };
}

function notifyListeners() {
  const snapshot = getCurrentSnapshot();
  sharedState.listeners.forEach((listener) => listener(snapshot));
}

function clearReconnectTimeout() {
  if (sharedState.reconnectTimeout) {
    window.clearTimeout(sharedState.reconnectTimeout);
    sharedState.reconnectTimeout = null;
  }
}

function clearHealthcheckInterval() {
  if (sharedState.healthcheckInterval) {
    window.clearInterval(sharedState.healthcheckInterval);
    sharedState.healthcheckInterval = null;
  }
}

function compareOnlineUsers(a, b, currentUserId) {
  const aWeight = a.id != null && a.id === currentUserId ? 0 : (a.role === 'master' || a.role === 'admin' ? 1 : 2);
  const bWeight = b.id != null && b.id === currentUserId ? 0 : (b.role === 'master' || b.role === 'admin' ? 1 : 2);

  if (aWeight !== bWeight) return aWeight - bWeight;
  return normalizeName(a.nome).localeCompare(normalizeName(b.nome), 'pt-BR', { sensitivity: 'base' });
}

function findUserDetails(metaUser) {
  const metaId = metaUser?.id ?? null;
  const metaName = normalizeName(metaUser?.nome);
  const metaRole = normalizeRole(metaUser?.role);

  return sharedState.allUsers.find((item) => (
    (metaId != null && item?.id === metaId)
    || (normalizeName(item?.nome) === metaName && normalizeRole(item?.role) === metaRole)
  )) || null;
}

function mapPresenceUsers(presenceState, currentUserId) {
  const deduped = new Map();

  Object.values(presenceState || {}).forEach((entry) => {
    const metas = Array.isArray(entry) ? entry : [];

    metas.forEach((meta) => {
      const userDetails = findUserDetails(meta);
      const user = {
        id: meta?.id ?? userDetails?.id ?? null,
        nome: normalizeName(meta?.nome || userDetails?.nome),
        role: normalizeRole(meta?.role || userDetails?.role),
        auth_user_id: normalizeAuthUserId(meta?.auth_user_id || userDetails?.auth_user_id),
      };

      const dedupeKey = user.id ?? `${user.nome}-${user.role}`;
      if (!deduped.has(dedupeKey)) {
        deduped.set(dedupeKey, user);
      }
    });
  });

  return Array.from(deduped.values()).sort((a, b) => compareOnlineUsers(a, b, currentUserId));
}

async function loadAllUsers() {
  try {
    const { data, error } = await listarUsuarios();
    if (error) return;

    sharedState.allUsers = (Array.isArray(data) ? data : []).map((item) => ({
      id: item?.id ?? null,
      nome: normalizeName(item?.username),
      role: normalizeRole(item?.role),
      auth_user_id: normalizeAuthUserId(item?.auth_user_id),
    }));
    notifyListeners();
  } catch {
    sharedState.allUsers = [];
    notifyListeners();
  }
}

function stopSharedPresence({ preserveUsers = false } = {}) {
  clearReconnectTimeout();
  clearHealthcheckInterval();

  if (sharedState.channel) {
    try {
      sharedState.channel.untrack();
    } catch {
      // noop
    }

    try {
      supabase.removeChannel(sharedState.channel);
    } catch {
      sharedState.channel.unsubscribe();
    }
  }

  sharedState.channel = null;
  sharedState.currentUserKey = '';
  sharedState.currentUser = null;
  sharedState.subscriptionStatus = 'closed';
  if (!preserveUsers) {
    sharedState.allUsers = [];
  }
  sharedState.onlineUsers = [];
  sharedState.presenceUnavailable = false;
  notifyListeners();
}

async function trackCurrentUser(channel, currentUser) {
  await channel.track({
    id: currentUser?.id ?? null,
    nome: normalizeName(currentUser?.username),
    role: normalizeRole(currentUser?.role),
    auth_user_id: normalizeAuthUserId(currentUser?.auth_user_id),
    joined_at: new Date().toISOString(),
  });
}

function syncPresenceSnapshot(channel, currentUser) {
  sharedState.onlineUsers = mapPresenceUsers(channel.presenceState(), currentUser?.id ?? null);
  sharedState.presenceUnavailable = false;
  notifyListeners();
}

function scheduleReconnect(currentUser, delayMs = RECONNECT_DELAY_MS) {
  if (!currentUser || sharedState.refCount === 0 || sharedState.reconnectTimeout) return;

  sharedState.reconnectTimeout = window.setTimeout(() => {
    sharedState.reconnectTimeout = null;
    startSharedPresence(currentUser, { force: true });
  }, delayMs);
}

function startSharedPresence(currentUser, options = {}) {
  const { force = false } = options;
  const nextUserKey = String(currentUser?.id || currentUser?.username || '');
  if (!nextUserKey) {
    stopSharedPresence();
    return;
  }

  if (!force && sharedState.channel && sharedState.currentUserKey === nextUserKey && sharedState.subscriptionStatus === 'SUBSCRIBED') {
    return;
  }

  stopSharedPresence({ preserveUsers: true });
  sharedState.currentUserKey = nextUserKey;
  sharedState.currentUser = currentUser;
  sharedState.presenceUnavailable = false;

  const channel = supabase.channel(CHANNEL_NAME, {
    config: {
      presence: {
        key: nextUserKey,
      },
    },
  });

  sharedState.channel = channel;
  sharedState.subscriptionStatus = 'joining';
  loadAllUsers();
  notifyListeners();

  channel
    .on('presence', { event: 'sync' }, () => {
      try {
        syncPresenceSnapshot(channel, currentUser);
      } catch {
        sharedState.onlineUsers = [];
        sharedState.presenceUnavailable = true;
      }
      notifyListeners();
    })
    .subscribe(async (status) => {
      if (channel !== sharedState.channel) return;
      sharedState.subscriptionStatus = status;

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        sharedState.onlineUsers = [];
        sharedState.presenceUnavailable = true;
        notifyListeners();
        scheduleReconnect(currentUser);
        return;
      }

      if (status !== 'SUBSCRIBED') return;

      try {
        clearReconnectTimeout();
        await trackCurrentUser(channel, currentUser);
        syncPresenceSnapshot(channel, currentUser);
      } catch {
        if (channel !== sharedState.channel) return;
        sharedState.onlineUsers = [];
        sharedState.presenceUnavailable = true;
        notifyListeners();
        scheduleReconnect(currentUser);
      }
    });

  clearHealthcheckInterval();
  sharedState.healthcheckInterval = window.setInterval(async () => {
    if (sharedState.channel !== channel || sharedState.refCount === 0) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    if (sharedState.subscriptionStatus !== 'SUBSCRIBED') {
      scheduleReconnect(currentUser, 0);
      return;
    }

    try {
      const state = channel.presenceState();
      const hasCurrentUser = Object.values(state || {})
        .flat()
        .some((meta) => String(meta?.id ?? '') === String(currentUser?.id ?? ''));

      if (!hasCurrentUser) {
        await trackCurrentUser(channel, currentUser);
      }

      syncPresenceSnapshot(channel, currentUser);
    } catch {
      scheduleReconnect(currentUser, 0);
    }
  }, PRESENCE_HEALTHCHECK_MS);
}

export function useOnlineUsers() {
  const currentUser = useMemo(() => getSessionUser(), []);
  const [snapshot, setSnapshot] = useState(() => getCurrentSnapshot());

  useEffect(() => {
    if (!currentUser) {
      setSnapshot({ onlineUsers: [], offlineUsers: [], totalOnline: 0 });
      return () => {};
    }

    sharedState.refCount += 1;
    sharedState.listeners.add(setSnapshot);
    setSnapshot(getCurrentSnapshot());
    startSharedPresence(currentUser);

    const retryVisibilitySync = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      startSharedPresence(currentUser, { force: sharedState.subscriptionStatus !== 'SUBSCRIBED' });
    };

    window.addEventListener('focus', retryVisibilitySync);
    document.addEventListener('visibilitychange', retryVisibilitySync);

    return () => {
      window.removeEventListener('focus', retryVisibilitySync);
      document.removeEventListener('visibilitychange', retryVisibilitySync);
      sharedState.listeners.delete(setSnapshot);
      sharedState.refCount = Math.max(0, sharedState.refCount - 1);

      if (sharedState.refCount === 0) {
        stopSharedPresence();
      }
    };
  }, [currentUser]);

  if (!currentUser) {
    return { onlineUsers: [], offlineUsers: [], totalOnline: 0 };
  }

  return snapshot;
}

export default useOnlineUsers;
