import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifCtx, notifPayloadString } from '@/features/notifications';
import { Container, Heading, Text, Btn, PageLayout } from '@/components';
import type { NotificationItemDto } from '@/types/api';

function notifAction(item: NotificationItemDto): { label: string; href: string } | null {
  switch (item.type) {
    case 'CHAT_MESSAGE': {
      const fromUsername = notifPayloadString(item, 'fromUsername');
      return { label: 'Open chat', href: fromUsername ? `/chat/${fromUsername}` : '/chat' };
    }
    case 'FRIEND_REQUEST':
      return { label: 'View requests', href: '/friends/requests' };
    case 'FRIEND_ACCEPTED':
      return { label: 'View friends', href: '/friends' };
    case 'LOBBY_INVITE':
      return { label: 'View invite', href: '/play' };
    default:
      return null;
  }
}

function NotifRow({ item }: { item: NotificationItemDto }) {
  const action = notifAction(item);
  const isUnread = !item.readAt;

  return (
    <Container>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          {isUnread && <span className="w-1.5 h-1.5 bg-red-500 shrink-0" />}
          {item.title && <Text className="font-bold truncate">{item.title}</Text>}
        </div>
        {item.content && (
          <Text variant="dim" size="sm" className="truncate">
            {item.content}
          </Text>
        )}
        <Text variant="muted" size="xs">
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </div>

      {action && (
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={action.href}
            className="text-xs uppercase tracking-widest text-dim hover:text-default transition-colors whitespace-nowrap"
          >
            {action.label}
          </Link>
        </div>
      )}
    </Container>
  );
}

export default function Notifications() {
  const { items, nextCursor, loading, markAllRead, loadMore } = useNotifCtx();

  useEffect(() => {
    void markAllRead();
  }, [markAllRead]);

  return (
    <PageLayout maxWidth="max-w-xl">
      <Heading level={3}>Notifications</Heading>

      {items.length === 0 && !loading ? (
        <Text variant="muted">No notifications yet.</Text>
      ) : (
        <>
          {items.map((item) => (
            <NotifRow key={item.id} item={item} />
          ))}
        </>
      )}

      {loading && <Text variant="muted">Loading...</Text>}

      {nextCursor !== null && !loading && (
        <div className="flex justify-center">
          <Btn size="sm" onClick={loadMore}>
            Load more
          </Btn>
        </div>
      )}
    </PageLayout>
  );
}
