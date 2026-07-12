import type { NotificationItemDto } from '@/types/api';

export function notifPayloadString(item: NotificationItemDto, key: string): string | undefined {
  const value = item.payload?.[key];
  return typeof value === 'string' ? value : undefined;
}
