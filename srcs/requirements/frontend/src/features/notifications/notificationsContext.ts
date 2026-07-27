import { createContext } from 'react';
import type { NotificationItemDto } from '@/types/api';

export interface NotificationsCtxValue {
  items: NotificationItemDto[];
  unreadCount: number;
  nextCursor: number | null;
  loading: boolean;
  markRead: (ids: number[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const NotificationsCtx = createContext<NotificationsCtxValue | null>(null);
