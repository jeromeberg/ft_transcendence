import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tError } from '@/features/i18n';
import { Avatar, Btn, Heading, List, Text } from '@/components';
import { getIncomingRequests, acceptFriendRequest, declineFriendRequest } from '@/api/friends.api';
import type { Friend } from './types';

interface IncomingRequestsProps {
  className?: string;
  refreshKey?: number;
}

export default function IncomingRequests({ className = '', refreshKey }: IncomingRequestsProps) {
  const { t } = useTranslation('pages');
  const [requests, setRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getIncomingRequests()
      .then((data) =>
        setRequests(
          data.map((item) => ({
            id: item.id,
            username: item.username,
            avatarSrc: item.avatarUrl,
            status: 'OFFLINE' as const,
          })),
        ),
      )
      .catch((err: unknown) =>
        setError(err instanceof Error ? tError(err.message, t) : t('friends.error_requests')),
      )
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function handleAccept(username: string) {
    acceptFriendRequest(username)
      .then(() => setRequests((prev) => prev.filter((r) => r.username !== username)))
      .catch((err: unknown) =>
        setError(err instanceof Error ? tError(err.message, t) : t('friends.error_accept')),
      );
  }

  function handleDecline(username: string) {
    declineFriendRequest(username)
      .then(() => setRequests((prev) => prev.filter((r) => r.username !== username)))
      .catch((err: unknown) =>
        setError(err instanceof Error ? tError(err.message, t) : t('friends.error_decline')),
      );
  }

  return (
    <section className={className}>
      <Heading level={4}>{t('friends.incoming_heading', { count: requests.length })}</Heading>
      {loading ? (
        <Text className="mt-4" variant="muted">
          {t('common:loading')}
        </Text>
      ) : error ? (
        <Text className="mt-4" variant="error">
          {error}
        </Text>
      ) : requests.length === 0 ? (
        <Text className="mt-4" variant="muted">
          {t('friends.no_incoming')}
        </Text>
      ) : (
        <List
          className="mt-4"
          items={requests}
          renderItem={(item: Friend) => (
            <div className="flex flex-col gap-2 min-[370px]:flex-row min-[370px]:items-center min-[370px]:justify-between">
              <Link
                to={`/profile/${item.username}`}
                className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-default"
              >
                <Avatar username={item.username} src={item.avatarSrc} size="sm" />
                <Text className="truncate">{item.username}</Text>
              </Link>
              <div className="flex items-center gap-1">
                <Btn size="sm" variant="danger" onClick={() => handleDecline(item.username)}>
                  {t('friends.decline')}
                </Btn>
                <Btn size="sm" onClick={() => handleAccept(item.username)}>
                  {t('friends.accept')}
                </Btn>
              </div>
            </div>
          )}
        />
      )}
    </section>
  );
}
