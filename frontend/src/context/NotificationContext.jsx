import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, TOKEN_KEY } from '../services/api';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const listRef = useRef([]);
  listRef.current = notifications;

  const refresh = useCallback(async () => {
    try {
      const data = await notificationService.list({ limit: 8 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (_e) {
      /* non-critical */
    }
  }, []);

  // Load history, then keep it live over a socket authenticated with the same JWT.
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }
    refresh();

    const socket = io(SOCKET_URL, { auth: { token: localStorage.getItem(TOKEN_KEY) }, transports: ['websocket', 'polling'] });
    socket.on('notification', (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 8));
      setUnreadCount((c) => c + 1);
      toast.notification(n.message);
    });
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, refresh]);

  const markRead = useCallback(
    async (id) => {
      const target = listRef.current.find((n) => n._id === id);
      if (!target || target.isRead) return;
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(c - 1, 0));
      try {
        await notificationService.markRead(id);
      } catch (_e) {
        refresh();
      }
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllRead();
    } catch (_e) {
      refresh();
    }
  }, [refresh]);

  const value = useMemo(() => ({ notifications, unreadCount, refresh, markRead, markAllRead }), [notifications, unreadCount, refresh, markRead, markAllRead]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
