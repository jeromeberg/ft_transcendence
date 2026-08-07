import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Btn, Heading, Input, List, Pagination, Status, Text } from '@/components';
import { useTranslation } from 'react-i18next';
import { tError } from '@/features/i18n';
import { useIsOwnProfile } from '@/features/auth';
import { getFriends } from '@/api/friends.api';
import { useStatus } from '@/hooks/useStatus';
import type { Friend } from './types';

const PAGE_SIZE = 20;

interface FriendsListProps {
  username: string;
  limit?: number;
  className?: string;
  refreshKey?: number;
  showMsgBtn?: boolean;
  showRequestsBtn?: boolean;
  showSearchBar?: boolean;
  onMsgClick?: () => void;
}

export default function FriendsList({
  username,
  limit,
  className = '',
  refreshKey,
  showMsgBtn,
  showRequestsBtn,
  showSearchBar,
  onMsgClick,
}: FriendsListProps) {
  const { t } = useTranslation('pages');
  const isOwnProfile = useIsOwnProfile(username);
  const getStatus = useStatus();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getFriends(username)
      .then((data) => {
        if (cancelled) return;
        setFriends(
          data.map((item) => ({
            id: item.id,
            username: item.username,
            avatarSrc: item.avatarUrl,
            status: getStatus(item.status, item.id, item.username),
          })),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? tError(err.message, t) : t('friends.error_load');
        setError(message);
        setFriends([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [getStatus, isOwnProfile, refreshKey, username]);

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? friends.filter((f) => f.username.toLowerCase().includes(q)) : friends;
  }, [friends, query]);

  const paginated = useMemo(() => {
    if (typeof limit === 'number') return filtered.slice(0, limit);
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, limit, page]);

  const totalPages = typeof limit === 'number' ? 1 : Math.ceil(filtered.length / PAGE_SIZE);
  const showSearch = !limit;
  const showPagination = !limit && totalPages > 1;

  return (
    <section className={className}>
      <div className="flex items-center justify-between">
        <Heading level={3}>{t('friends.list_heading', { count: friends.length })}</Heading>
        {isOwnProfile && showRequestsBtn && (
          <Btn as={Link} to="/friends/requests" variant="ghost" size="sm">
            {t('nav:requests')}
          </Btn>
        )}
      </div>

      {showSearchBar && showSearch && friends.length > 0 && (
        <Input
          className="mt-4"
          placeholder={t('friends.search_placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {loading ? (
        <Text className="mt-6" variant="muted">
          {t('common:loading')}
        </Text>
      ) : error ? (
        <Text className="mt-6" variant="error">
          {error}
        </Text>
      ) : paginated.length === 0 ? (
        <Text className="mt-6" variant="muted">
          {query.trim() ? t('friends.search_empty') : t('friends.no_friends')}
        </Text>
      ) : (
        <List
          className="mt-6"
          items={paginated}
          renderItem={(item: Friend) => (
            <div className="flex items-center justify-between gap-4">
              <Link
                to={`/profile/${item.username}`}
                className="flex items-center gap-4 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-default"
              >
                <Avatar username={item.username} src={item.avatarSrc} size="sm" />
                <Text>
                  <Status status={item.status} hoverText={item.status} /> {item.username}
                </Text>
              </Link>
              {showMsgBtn && (
                <Btn
                  as={Link}
                  to={`/chat/${item.username}`}
                  variant="ghost"
                  size="sm"
                  onClick={onMsgClick}
                >
                  {t('common:message')}
                </Btn>
              )}
            </div>
          )}
        />
      )}

      {showPagination && (
        <Pagination
          className="mt-4"
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}
