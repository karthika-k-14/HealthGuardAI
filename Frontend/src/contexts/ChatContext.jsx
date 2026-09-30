import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getItem, setItem, getJSON } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { ROLES } from '../constants/roles';
import { useAuth } from './AuthContext';

const ChatContext = createContext(undefined);

const CHAT_STORAGE_KEY_BY_ROLE = {
  [ROLES.CITIZEN]: STORAGE_KEYS.CHAT_CITIZEN,
  [ROLES.ASHA]: STORAGE_KEYS.CHAT_ASHA,
  [ROLES.HEALTH_OFFICER]: STORAGE_KEYS.CHAT_OFFICER,
  [ROLES.ADMIN]: STORAGE_KEYS.CHAT_ADMIN,
};

function lastSeenKey(role) {
  return `hg_chat_last_seen_${role}`;
}

/**
 * Tracks whether the signed-in role has unread AI assistant replies,
 * so the Sidebar's chat/assistant nav link can show a subtle unread
 * indicator — even before the chat page itself has been opened this
 * session, since the initial count is read straight from the
 * role's persisted chat history. ChatbotWidget keeps the count live
 * while chatting via `reportMessageCount`; the chat page calls
 * `markSeen()` on mount to clear the indicator.
 */
export function ChatProvider({ children }) {
  const { role } = useAuth();
  const [messageCount, setMessageCount] = useState(0);
  const [lastSeenCount, setLastSeenCount] = useState(0);

  // Whenever the signed-in role changes (login/logout/switch), seed
  // both counts from whatever is already persisted for that role.
  useEffect(() => {
    if (!role) {
      setMessageCount(0);
      setLastSeenCount(0);
      return;
    }
    const chatKey = CHAT_STORAGE_KEY_BY_ROLE[role];
    const history = chatKey ? getJSON(chatKey, []) : [];
    setMessageCount(Array.isArray(history) ? history.length : 0);
    setLastSeenCount(Number(getItem(lastSeenKey(role))) || 0);
  }, [role]);

  const reportMessageCount = useCallback((count) => {
    setMessageCount(count);
  }, []);

  const markSeen = useCallback(() => {
    if (!role) return;
    setItem(lastSeenKey(role), String(messageCount));
    setLastSeenCount(messageCount);
  }, [role, messageCount]);

  const hasUnread = messageCount > lastSeenCount;

  const value = useMemo(
    () => ({ hasUnread, reportMessageCount, markSeen }),
    [hasUnread, reportMessageCount, markSeen]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
