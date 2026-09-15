import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tError } from '@/features/i18n';
import { Avatar, Btn, Heading, List, Text } from '@/components';
import { getSentRequests } from '@/api/friends.api';
import type { Friend } from './types';

interface PendingRequestsProps {
  className?: string;
  refreshKey?: number;
}

export default function PendingRequests({ className = '', refreshKey = 0 }: PendingRequestsProps) {
  const { t } = useTranslation('pages');
  const [pending, setPending] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getSentRequests()
      .then((data) =>
        setPending(
          data.map((item) => ({
            id: item.id,
            username: item.username,
            avatarSrc: item.avatarUrl,
            status: 'OFFLINE',
          })),
        ),
      )
      .catch((err: unknown) =>
        setError(err instanceof Error ? tError(err.message, t) : t('friends.error_requests')),
      )
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <section className={className}>
      <Heading level={4}>{t('friends.pending_heading', { count: pending.length })}</Heading>
      {loading ? (
        <Text className="mt-4" variant="muted">
          {t('common:loading')}
        </Text>
      ) : error ? (
        <Text className="mt-4" variant="error">
          {error}
        </Text>
      ) : pending.length === 0 ? (
        <Text className="mt-4" variant="muted">
          {t('friends.no_pending')}
        </Text>
      ) : (
        <List
          className="mt-4"
          items={pending}
          renderItem={(item: Friend) => (
            <div className="flex flex-col gap-2 min-[370px]:flex-row min-[370px]:items-center min-[370px]:justify-between">
              <Link
                to={`/profile/${item.username}`}
                className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-default"
              >
                <Avatar username={item.username} src={item.avatarSrc} size="sm" />
                <Text className="truncate">{item.username}</Text>
              </Link>
              <Btn size="sm" variant="ghost" disabled>
                {t('friends.pending_btn')}
              </Btn>
            </div>
          )}
        />
      )}
    </section>
  );
}
