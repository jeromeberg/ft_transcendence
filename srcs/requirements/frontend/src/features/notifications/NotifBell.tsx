import { Link } from 'react-router-dom';
import { useNotifCtx } from './useNotifCtx';

export function NotifBell() {
  const { unreadCount } = useNotifCtx();

  return (
    <Link
      to="/notifications"
      className="flex items-center gap-1 px-2 py-1 text-xs uppercase tracking-widest text-dim hover:text-default hover:bg-muted transition-colors duration-100"
    >
      <span className="relative">
        [!]
        {unreadCount > 0 && <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500" />}
      </span>
    </Link>
  );
}
