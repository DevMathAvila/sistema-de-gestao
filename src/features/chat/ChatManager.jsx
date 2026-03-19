import React from 'react';
import { getSessionUser, isRuninKioskUser } from '../../core/auth/session';
import { useChatContext } from './ChatContext';
import ChatWindow from './components/ChatWindow';

const POSITIONS = [16, 332, 648, 964];
const DESKTOP_WIDGET_OFFSET = 88;

export default function ChatManager() {
  const sessionUser = getSessionUser();
  const { openChats, naoLidasPorUsuario, focusedChatId } = useChatContext();
  const mobileChat = openChats[openChats.length - 1] || null;

  if (isRuninKioskUser(sessionUser)) return null;
  if (!openChats?.length) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[9990] hidden sm:block">
        {openChats.map((chat, index) => (
          <div
            key={chat.usuarioId}
            className="pointer-events-auto fixed bottom-4"
            style={{ right: `${(POSITIONS[index] || POSITIONS[0]) + DESKTOP_WIDGET_OFFSET}px` }}
          >
            <ChatWindow
            usuario={chat.usuario}
            outroUsuarioId={chat.usuarioId}
            minimizada={chat.minimizada}
            unreadCount={naoLidasPorUsuario?.[chat.usuarioId] || 0}
            isFocused={focusedChatId === chat.usuarioId}
          />
        </div>
      ))}
      </div>

      {mobileChat && (
        <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+5.6rem)] z-[9990] sm:hidden">
          <ChatWindow
          usuario={mobileChat.usuario}
          outroUsuarioId={mobileChat.usuarioId}
          minimizada={mobileChat.minimizada}
          unreadCount={naoLidasPorUsuario?.[mobileChat.usuarioId] || 0}
          isFocused={focusedChatId === mobileChat.usuarioId}
        />
      </div>
      )}
    </>
  );
}
