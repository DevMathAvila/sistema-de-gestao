import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../core/api/supabaseClient';
import { getSessionUser, setSessionUser } from '../../../core/auth/session';

const UNREAD_SYNC_INTERVAL_MS = 4000;

function somarMapa(mapa) {
  return Object.values(mapa || {}).reduce((total, value) => total + (Number(value) || 0), 0);
}

function tocarNotificacao() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => {
      try {
        ctx.close();
      } catch {
        // noop
      }
    };
  } catch {
    // falhar silenciosamente se o browser bloquear AudioContext
  }
}

function buildUnreadMap(rows) {
  return (rows || []).reduce((acc, item) => {
    const remetenteId = item?.remetente_id;
    if (!remetenteId) return acc;
    acc[remetenteId] = (acc[remetenteId] || 0) + 1;
    return acc;
  }, {});
}

export function useChatNotificacoes(conversasAbertas = []) {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const [meuAuthId, setMeuAuthId] = useState(sessionUser?.auth_user_id || null);
  const [naoLidasPorUsuario, setNaoLidasPorUsuario] = useState({});
  const conversasAbertasSet = useMemo(() => new Set(conversasAbertas.filter(Boolean)), [conversasAbertas]);

  const carregarNaoLidas = useCallback(async () => {
    if (!meuAuthId) {
      setNaoLidasPorUsuario({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mensagens_chat')
        .select('remetente_id')
        .eq('destinatario_id', meuAuthId)
        .eq('lida', false);

      if (error) throw error;
      setNaoLidasPorUsuario(buildUnreadMap(data || []));
    } catch {
      setNaoLidasPorUsuario({});
    }
  }, [meuAuthId]);

  useEffect(() => {
    let active = true;

    async function hydrateAuthUserId() {
      if (meuAuthId) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authUserId = session?.user?.id || null;
        if (!active || !authUserId) return;

        setMeuAuthId(authUserId);

        if (sessionUser?.username) {
          setSessionUser({
            ...sessionUser,
            auth_user_id: authUserId,
          });
        }
      } catch {
        // falha silenciosa
      }
    }

    hydrateAuthUserId();

    return () => {
      active = false;
    };
  }, [meuAuthId, sessionUser]);

  useEffect(() => {
    carregarNaoLidas();
  }, [carregarNaoLidas]);

  useEffect(() => {
    if (!meuAuthId) return () => {};

    const intervalId = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      carregarNaoLidas();
    }, UNREAD_SYNC_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [carregarNaoLidas, meuAuthId]);

  useEffect(() => {
    if (!meuAuthId) return () => {};

    const channel = supabase
      .channel(`chat-notificacoes:${meuAuthId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens_chat',
        filter: `destinatario_id=eq.${meuAuthId}`,
      }, (payload) => {
        const remetenteId = payload?.new?.remetente_id || null;
        if (!remetenteId) return;
        if (conversasAbertasSet.has(remetenteId)) return;

        setNaoLidasPorUsuario((prev) => ({
          ...prev,
          [remetenteId]: (prev[remetenteId] || 0) + 1,
        }));
        tocarNotificacao();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        try {
          channel.unsubscribe();
        } catch {
          // falha silenciosa
        }
      }
    };
  }, [conversasAbertasSet, meuAuthId]);

  useEffect(() => {
    if (conversasAbertasSet.size === 0) return;

    setNaoLidasPorUsuario((prev) => {
      let changed = false;
      const next = { ...prev };

      conversasAbertasSet.forEach((remetenteId) => {
        if ((next[remetenteId] || 0) > 0) {
          next[remetenteId] = 0;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [conversasAbertasSet]);

  const marcarComoLida = (remetenteId) => {
    if (!remetenteId) return;
    setNaoLidasPorUsuario((prev) => ({
      ...prev,
      [remetenteId]: 0,
    }));
  };

  return {
    totalNaoLidas: somarMapa(naoLidasPorUsuario),
    naoLidasPorUsuario,
    marcarComoLida,
  };
}

export default useChatNotificacoes;
