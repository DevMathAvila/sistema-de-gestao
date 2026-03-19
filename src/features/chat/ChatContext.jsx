import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSessionUser, isRuninKioskUser } from '../../core/auth/session';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import { useChatNotificacoes } from './hooks/useChatNotificacoes';

const InternalChatContext = createContext({
  openChats: [],
  abrirChat: () => {},
  fecharChat: () => {},
  minimizarChat: () => {},
  focarChat: () => {},
  totalNaoLidas: 0,
  naoLidasPorUsuario: {},
  focusedChatId: null,
});

function sanitizeChatUser(usuario) {
  if (!usuario?.auth_user_id) return null;

  return {
    usuarioId: usuario.auth_user_id,
    usuario: {
      id: usuario.id ?? null,
      nome: String(usuario.nome || usuario.username || 'Usuario').trim() || 'Usuario',
      role: String(usuario.role || '').trim() || '—',
      auth_user_id: usuario.auth_user_id,
    },
    minimizada: false,
  };
}

export default function ChatContext({ children }) {
  const sessionUser = getSessionUser();
  const [openChats, setOpenChats] = useState([]);
  const [focusedChatId, setFocusedChatId] = useState(null);
  const focusedChatsIds = useMemo(
    () => (focusedChatId ? [focusedChatId] : []),
    [focusedChatId],
  );
  const { totalNaoLidas, naoLidasPorUsuario, marcarComoLida } = useChatNotificacoes(focusedChatsIds);
  const { onlineUsers, offlineUsers } = useOnlineUsers();
  const supportUsers = useMemo(() => [...onlineUsers, ...offlineUsers], [offlineUsers, onlineUsers]);

  const abrirChat = useCallback((usuario) => {
    const nextChat = sanitizeChatUser(usuario);
    if (!nextChat) return;
    if (nextChat.usuarioId === sessionUser?.auth_user_id) return;

    setOpenChats((prev) => {
      const alreadyOpen = prev.find((item) => item.usuarioId === nextChat.usuarioId);
      if (alreadyOpen) {
        return prev.map((item) => (
          item.usuarioId === nextChat.usuarioId
            ? { ...item, usuario: nextChat.usuario, minimizada: false }
            : item
        ));
      }

      const next = [...prev, nextChat];
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });

    setFocusedChatId(nextChat.usuarioId);
  }, [sessionUser?.auth_user_id]);

  const fecharChat = useCallback((usuarioId) => {
    setOpenChats((prev) => prev.filter((item) => item.usuarioId !== usuarioId));
    setFocusedChatId((prev) => (prev === usuarioId ? null : prev));
  }, []);

  const minimizarChat = useCallback((usuarioId) => {
    let restored = false;

    setOpenChats((prev) => prev.map((item) => {
      if (item.usuarioId !== usuarioId) return item;
      const nextMinimizada = !item.minimizada;
      restored = item.minimizada && nextMinimizada === false;
      return { ...item, minimizada: nextMinimizada };
    }));

    setFocusedChatId((prev) => {
      if (restored) return usuarioId;
      return prev === usuarioId ? null : prev;
    });
  }, []);

  const focarChat = useCallback((usuarioId) => {
    if (!usuarioId) return;
    setFocusedChatId(usuarioId);
    marcarComoLida(usuarioId);
  }, [marcarComoLida]);

  useEffect(() => {
    const remetentesComNaoLida = Object.entries(naoLidasPorUsuario || {})
      .filter(([, total]) => Number(total) > 0)
      .map(([usuarioId]) => usuarioId);

    if (remetentesComNaoLida.length === 0) return;

    setOpenChats((prev) => {
      let next = [...prev];
      let changed = false;

      remetentesComNaoLida.forEach((usuarioId) => {
        const alreadyOpen = next.find((item) => item.usuarioId === usuarioId);
        if (alreadyOpen) {
          return;
        }

        const matchedUser = supportUsers.find((item) => item?.auth_user_id === usuarioId);
        const nextChat = sanitizeChatUser(matchedUser || {
          nome: 'Usuario',
          role: '—',
          auth_user_id: usuarioId,
        });

        if (!nextChat || nextChat.usuarioId === sessionUser?.auth_user_id) return;
        next.push({ ...nextChat, minimizada: true });
        changed = true;
      });

      if (!changed) return prev;
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });
  }, [naoLidasPorUsuario, sessionUser?.auth_user_id, supportUsers]);

  const value = useMemo(() => ({
    openChats,
    abrirChat,
    fecharChat,
    minimizarChat,
    focarChat,
    totalNaoLidas,
    naoLidasPorUsuario,
    focusedChatId,
  }), [abrirChat, fecharChat, focusedChatId, focarChat, minimizarChat, naoLidasPorUsuario, openChats, totalNaoLidas]);

  if (isRuninKioskUser(sessionUser)) {
    return children;
  }

  return (
    <InternalChatContext.Provider value={value}>
      {children}
    </InternalChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(InternalChatContext);
}
