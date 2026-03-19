import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../../core/api/supabaseClient';
import { getSessionUser, setSessionUser } from '../../../core/auth/session';

const MESSAGE_LIMIT = 50;
const CHAT_SYNC_INTERVAL_MS = 4000;

function normalizeMessage(row) {
  return {
    id: row?.id,
    remetente_id: row?.remetente_id || null,
    destinatario_id: row?.destinatario_id || null,
    conteudo: String(row?.conteudo || '').trim(),
    lida: Boolean(row?.lida),
    created_at: row?.created_at || new Date().toISOString(),
    optimistic: Boolean(row?.optimistic),
    local_id: row?.local_id || null,
  };
}

function buildPairFilter(meuAuthId, outroUsuarioId) {
  return `and(remetente_id.eq.${meuAuthId},destinatario_id.eq.${outroUsuarioId}),and(remetente_id.eq.${outroUsuarioId},destinatario_id.eq.${meuAuthId})`;
}

function isConversationMessage(message, meuAuthId, outroUsuarioId) {
  if (!message || !meuAuthId || !outroUsuarioId) return false;

  const sentByMe = message.remetente_id === meuAuthId && message.destinatario_id === outroUsuarioId;
  const receivedByMe = message.remetente_id === outroUsuarioId && message.destinatario_id === meuAuthId;
  return sentByMe || receivedByMe;
}

function upsertMessage(list, nextMessage) {
  if (!nextMessage?.id) return list;
  if (list.some((item) => item.id === nextMessage.id)) {
    return list.map((item) => (item.id === nextMessage.id ? nextMessage : item));
  }
  return [...list, nextMessage].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

function replaceOptimisticMessage(list, localId, nextMessage) {
  if (!localId) return upsertMessage(list, nextMessage);

  const replaced = list.map((item) => (
    item.local_id === localId
      ? nextMessage
      : item
  ));

  if (replaced.some((item) => item.id === nextMessage.id)) {
    return replaced
      .filter((item, index, arr) => arr.findIndex((entry) => entry.id === item.id) === index)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  return replaced.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function useChat(outroUsuarioId, isFocused = false) {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const [meuAuthId, setMeuAuthId] = useState(sessionUser?.auth_user_id || null);
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(Boolean(meuAuthId && outroUsuarioId));
  const [outroDigitando, setOutroDigitando] = useState(false);
  const channelRef = useRef(null);
  const subscriptionReadyRef = useRef(false);
  const pollingRef = useRef(null);

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

  const marcarMensagensComoLidas = useCallback(async () => {
    if (!meuAuthId || !outroUsuarioId) return;

    try {
      await supabase
        .from('mensagens_chat')
        .update({ lida: true })
        .eq('destinatario_id', meuAuthId)
        .eq('remetente_id', outroUsuarioId)
        .eq('lida', false);

      setMensagens((prev) => prev.map((item) => (
        item.destinatario_id === meuAuthId && item.remetente_id === outroUsuarioId
          ? { ...item, lida: true }
          : item
      )));
    } catch {
      // falha silenciosa por requisito da feature
    }
  }, [meuAuthId, outroUsuarioId]);

  const carregarMensagens = useCallback(async (showLoading = true) => {
    if (!meuAuthId || !outroUsuarioId) {
      setMensagens([]);
      setCarregando(false);
      return;
    }

    if (showLoading) setCarregando(true);

    try {
      const { data, error } = await supabase
        .from('mensagens_chat')
        .select('id, remetente_id, destinatario_id, conteudo, lida, created_at')
        .or(buildPairFilter(meuAuthId, outroUsuarioId))
        .order('created_at', { ascending: false })
        .limit(MESSAGE_LIMIT);

      if (error) throw error;

      const ordered = (data || [])
        .map(normalizeMessage)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setMensagens(ordered);
    } catch {
      if (showLoading) {
        setMensagens([]);
      }
    } finally {
      if (showLoading) setCarregando(false);
    }
  }, [meuAuthId, outroUsuarioId]);

  useEffect(() => {
    carregarMensagens(true).catch(() => {});
  }, [carregarMensagens]);

  useEffect(() => {
    if (!isFocused) return;
    marcarMensagensComoLidas();
  }, [isFocused, marcarMensagensComoLidas]);

  useEffect(() => {
    if (!meuAuthId || !outroUsuarioId) return () => {};

    const channelName = `chat:${[meuAuthId, outroUsuarioId].sort().join('_')}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false, ack: false },
      },
    });
    channelRef.current = channel;
    let typingTimeoutId = null;
    pollingRef.current = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      carregarMensagens(false).catch(() => {});
    }, CHAT_SYNC_INTERVAL_MS);

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens_chat',
      }, async (payload) => {
        const nextMessage = normalizeMessage(payload?.new);
        if (!isConversationMessage(nextMessage, meuAuthId, outroUsuarioId)) return;

        setMensagens((prev) => upsertMessage(prev, nextMessage));

        if (isFocused && nextMessage.destinatario_id === meuAuthId) {
          await marcarMensagensComoLidas();
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'mensagens_chat',
      }, (payload) => {
        const nextMessage = normalizeMessage(payload?.new);
        if (!isConversationMessage(nextMessage, meuAuthId, outroUsuarioId)) return;
        setMensagens((prev) => upsertMessage(prev, nextMessage));
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const senderId = payload?.payload?.senderId || null;
        const receiverId = payload?.payload?.receiverId || null;
        const isTyping = Boolean(payload?.payload?.isTyping);

        if (senderId !== outroUsuarioId || receiverId !== meuAuthId) return;

        setOutroDigitando(isTyping);
        if (typingTimeoutId) window.clearTimeout(typingTimeoutId);
        if (isTyping) {
          typingTimeoutId = window.setTimeout(() => {
            setOutroDigitando(false);
          }, 1800);
        }
      })
      .on('broadcast', { event: 'message' }, (payload) => {
        const nextMessage = normalizeMessage(payload?.payload?.message);
        if (!isConversationMessage(nextMessage, meuAuthId, outroUsuarioId)) return;
        setMensagens((prev) => upsertMessage(prev, nextMessage));
      })
      .subscribe((status) => {
        subscriptionReadyRef.current = status === 'SUBSCRIBED';
      });

    return () => {
      channelRef.current = null;
      subscriptionReadyRef.current = false;
      if (typingTimeoutId) window.clearTimeout(typingTimeoutId);
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
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
  }, [carregarMensagens, isFocused, marcarMensagensComoLidas, meuAuthId, outroUsuarioId]);

  const informarDigitacao = useCallback((isTyping) => {
    if (!meuAuthId || !outroUsuarioId) return;
    const channel = channelRef.current;
    if (!channel || !subscriptionReadyRef.current) return;

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        senderId: meuAuthId,
        receiverId: outroUsuarioId,
        isTyping,
      },
    });
  }, [meuAuthId, outroUsuarioId]);

  const enviarMensagem = useCallback(async (conteudo) => {
    const texto = String(conteudo || '').trim();
    if (!texto || !meuAuthId || !outroUsuarioId) return false;

    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticMessage = normalizeMessage({
      id: localId,
      local_id: localId,
      remetente_id: meuAuthId,
      destinatario_id: outroUsuarioId,
      conteudo: texto,
      lida: false,
      created_at: new Date().toISOString(),
      optimistic: true,
    });

    setMensagens((prev) => [...prev, optimisticMessage].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));

    const { data, error } = await supabase
      .from('mensagens_chat')
      .insert({
        remetente_id: meuAuthId,
        destinatario_id: outroUsuarioId,
        conteudo: texto,
      })
      .select('id, remetente_id, destinatario_id, conteudo, lida, created_at')
      .single();

    if (error) {
      setMensagens((prev) => prev.filter((item) => item.local_id !== localId));
      throw error;
    }

    const nextMessage = normalizeMessage(data);
    setMensagens((prev) => replaceOptimisticMessage(prev, localId, nextMessage));

    const channel = channelRef.current;
    if (channel && subscriptionReadyRef.current) {
      channel.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          message: nextMessage,
        },
      });
    }

    return true;
  }, [meuAuthId, outroUsuarioId]);

  return {
    mensagens,
    enviarMensagem,
    carregando,
    outroDigitando,
    informarDigitacao,
  };
}

export default useChat;
