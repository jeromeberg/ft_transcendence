import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth, getToken } from '@/features/auth';
import { notificationsApi } from '@/api/notifications.api';
import type { NotificationItemDto } from '@/types/api';

interface NotificationsCtxValue {
  items: NotificationItemDto[];
  unreadCount: number;
  nextCursor: number | null;
  loading: boolean;
  markRead: (ids: number[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const NotificationsCtx = createContext<NotificationsCtxValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItemDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!user || !token) {
      setItems([]);
      setUnreadCount(0);
      setNextCursor(null);
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        const [countRes, listRes] = await Promise.all([
          notificationsApi.getUnreadCount(),
          notificationsApi.getNotifications(undefined, 20),
        ]);
        setUnreadCount(countRes.unreadCount);
        setItems(listRes.data);
        setNextCursor(listRes.nextCursor);
      } catch (e) {
        console.error('Failed to load notifications:', e);
      } finally {
        setLoading(false);
      }
    };
    init();

    const socket: Socket = io('/notifications', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    // Backfill anything missed while disconnected (reconnects only —
    // init() above already handles the initial load).
    let connectedOnce = false;
    socket.on('connect', () => {
      if (connectedOnce) init();
      connectedOnce = true;
    });

    socket.on('notifications:new', (item: NotificationItemDto) => {
      setItems((prev) => {
        if (prev.some((n) => n.id === item.id)) return prev;
        return [item, ...prev];
      });
    });

    socket.on('notifications:unread_count', ({ unreadCount: count }: { unreadCount: number }) => {
      setUnreadCount(count);
    });

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !socket.connected) {
        socket.auth = { token: getToken() };
        socket.connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      socket.off('connect');
      socket.off('notifications:new');
      socket.off('notifications:unread_count');
      document.removeEventListener('visibilitychange', handleVisibility);
      socket.disconnect();
    };
  }, [user]);

  const markRead = useCallback(async (ids: number[]) => {
    if (!ids.length) return;
    try {
      const res = await notificationsApi.markAsRead(ids);
      setUnreadCount(res.unreadCount);
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, readAt: n.readAt ?? now } : n)),
      );
    } catch (e) {
      console.error('Failed to mark notifications read:', e);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    try {
      const res = await notificationsApi.markAllAsRead();
      setUnreadCount(res.unreadCount);
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
    } catch (e) {
      console.error('Failed to mark all notifications read:', e);
    }
  }, [unreadCount]);

  const loadMore = useCallback(async () => {
    if (nextCursor === null || loading) return;
    setLoading(true);
    try {
      const res = await notificationsApi.getNotifications(nextCursor, 20);
      setItems((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const fresh = res.data.filter((n) => !existingIds.has(n.id));
        return [...prev, ...fresh];
      });
      setNextCursor(res.nextCursor);
    } catch (e) {
      console.error('Failed to load more notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [nextCursor, loading]);

  return (
    <NotificationsCtx.Provider
      value={{ items, unreadCount, nextCursor, loading, markRead, markAllRead, loadMore }}
    >
      {children}
    </NotificationsCtx.Provider>
  );
}
