import { API_NOTIFS, authHeaders, handleResponse } from '@/api/config.api';
import type {
  NotificationListResponseDto,
  NotificationUnreadCountDto,
  NotificationMarkReadResponseDto,
} from '@/types/api';

export const notificationsApi = {
  getNotifications: async (
    cursor?: number,
    take = 20,
    unreadOnly?: boolean,
  ): Promise<NotificationListResponseDto> => {
    const params = new URLSearchParams();
    if (cursor !== undefined) params.append('cursor', cursor.toString());
    params.append('take', take.toString());
    if (unreadOnly !== undefined) params.append('unreadOnly', String(unreadOnly));
    const qs = params.toString() ? '?' + params.toString() : '';
    const res = await fetch(`${API_NOTIFS}${qs}`, { headers: authHeaders() });
    return handleResponse<NotificationListResponseDto>(res);
  },

  getUnreadCount: async (): Promise<NotificationUnreadCountDto> => {
    const res = await fetch(`${API_NOTIFS}/unread-count`, { headers: authHeaders() });
    return handleResponse<NotificationUnreadCountDto>(res);
  },

  markAsRead: async (ids: number[]): Promise<NotificationMarkReadResponseDto> => {
    const res = await fetch(`${API_NOTIFS}/read`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    return handleResponse<NotificationMarkReadResponseDto>(res);
  },

  markAllAsRead: async (): Promise<NotificationMarkReadResponseDto> => {
    const res = await fetch(`${API_NOTIFS}/read-all`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return handleResponse<NotificationMarkReadResponseDto>(res);
  },
};
