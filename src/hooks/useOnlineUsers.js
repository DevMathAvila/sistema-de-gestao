import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../core/api/supabaseClient';
import { getSessionUser } from '../core/auth/session';
import { listarUsuarios } from '../core/api/supabaseSecure';

const CHANNEL_NAME = 'sistema_online';

const sharedState = {
  currentUserKey: '',
  refCount: 0,
  channel: null,
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

function stopSharedPresence() {
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
  sharedState.allUsers = [];
  sharedState.onlineUsers = [];
  sharedState.presenceUnavailable = false;
  notifyListeners();
}

function startSharedPresence(currentUser) {
  const nextUserKey = String(currentUser?.id || currentUser?.username || '');
  if (!nextUserKey) {
    stopSharedPresence();
    return;
  }

  if (sharedState.channel && sharedState.currentUserKey === nextUserKey) {
    return;
  }

  stopSharedPresence();
  sharedState.currentUserKey = nextUserKey;
  sharedState.presenceUnavailable = false;

  const channel = supabase.channel(CHANNEL_NAME, {
    config: {
      presence: {
        key: nextUserKey,
      },
    },
  });

  sharedState.channel = channel;
  loadAllUsers();
  notifyListeners();

  channel
    .on('presence', { event: 'sync' }, () => {
      try {
        sharedState.onlineUsers = mapPresenceUsers(channel.presenceState(), currentUser?.id ?? null);
        sharedState.presenceUnavailable = false;
      } catch {
        sharedState.onlineUsers = [];
        sharedState.presenceUnavailable = true;
      }
      notifyListeners();
    })
    .subscribe(async (status) => {
      if (channel !== sharedState.channel) return;

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        sharedState.onlineUsers = [];
        sharedState.presenceUnavailable = true;
        notifyListeners();
        return;
      }

      if (status !== 'SUBSCRIBED') return;

      try {
        await channel.track({
          id: currentUser?.id ?? null,
          nome: normalizeName(currentUser?.username),
          role: normalizeRole(currentUser?.role),
          auth_user_id: normalizeAuthUserId(currentUser?.auth_user_id),
          joined_at: new Date().toISOString(),
        });
      } catch {
        if (channel !== sharedState.channel) return;
        sharedState.onlineUsers = [];
        sharedState.presenceUnavailable = true;
        notifyListeners();
      }
    });
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

    return () => {
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
