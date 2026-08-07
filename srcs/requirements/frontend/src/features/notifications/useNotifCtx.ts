import { useContext } from 'react';
import { NotificationsCtx } from './notificationsContext';

export function useNotifCtx() {
  const ctx = useContext(NotificationsCtx);
  if (!ctx) throw new Error('useNotifCtx must be used inside NotificationsProvider');
  return ctx;
}
