import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tError } from '@/features/i18n';
import { Avatar, Btn, Heading, Input, Text, Pagination, PageLayout, Container } from '@/components';
import { getLeaderboard, type LeaderboardEntry } from '@/api/leaderboard.api';

type LeaderboardListItem = LeaderboardEntry & { id: string; [key: string]: unknown };

const LIMIT = 20;
const DEBOUNCE_MS = 300;

export default function Leaderboard() {
  const { t } = useTranslation(['pages', 'common']);
  const [players, setPlayers] = useState<LeaderboardListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minLevel, setMinLevel] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tooShort = query.trim().length > 0 && query.trim().length < 3;

  useEffect(() => {
    if (tooShort) {
      setDebouncedQuery('');
      setCurrentPage(1);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, tooShort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTotalPages(1);

    getLeaderboard(currentPage, LIMIT, debouncedQuery, sortOrder, minLevel)
      .then((response) => {
        if (cancelled) return;
        setPlayers(response.data.map((entry) => ({ ...entry, id: entry.username })));
        setTotalPages(response.totalPages);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? tError(err.message, t) : t('leaderboard.error'));
        setTotalPages(1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentPage, debouncedQuery, sortOrder, minLevel]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout maxWidth="max-w-2xl">
      <Heading level={2} className="mb-8">
        {t('leaderboard.title')}
      </Heading>
      <Container variant="default" className="mb-8">
        <div className="flex flex-wrap items-end gap-3 mb-6">
          <div className="flex-1 min-w-[160px] flex flex-col gap-1">
            <Text size="xs" variant="default" className="uppercase tracking-widest">
              &nbsp;
            </Text>
            <Input
              placeholder={t('leaderboard.search_placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Text size="xs" variant="default" className="uppercase tracking-widest">
              {t('leaderboard.sort_label')}
            </Text>
            <div className="flex">
              <Btn
                size="sm"
                variant={sortOrder === 'desc' ? 'primary' : 'secondary'}
                onClick={() => {
                  setSortOrder('desc');
                  setCurrentPage(1);
                }}
              >
                {t('leaderboard.wpm_down')}
              </Btn>
              <Btn
                size="sm"
                variant={sortOrder === 'asc' ? 'primary' : 'secondary'}
                onClick={() => {
                  setSortOrder('asc');
                  setCurrentPage(1);
                }}
              >
                {t('leaderboard.wpm_up')}
              </Btn>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Text size="xs" variant="default" className="uppercase tracking-widest">
              {t('leaderboard.min_level')}
            </Text>
            <div className="flex items-center border border-dim bg-black">
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMinLevel((l) => Math.max(1, l - 1));
                  setCurrentPage(1);
                }}
              >
                −
              </Btn>
              <Text className="px-3 min-w-[2rem] text-center">{minLevel}</Text>
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMinLevel((l) => l + 1);
                  setCurrentPage(1);
                }}
              >
                +
              </Btn>
            </div>
          </div>
        </div>

        {tooShort && (
          <Text className="mt-2" variant="error">
            {t('common:search.min_chars')}
          </Text>
        )}
      </Container>

      <div>
        {!tooShort && loading && (
          <Text className="mt-6" variant="dim">
            {t('leaderboard.loading')}
          </Text>
        )}
        {!tooShort && error && !loading && (
          <Text className="mt-6" variant="error">
            {error}
          </Text>
        )}
        {!tooShort && !loading && !error && players.length === 0 && (
          <Text className="mt-6" variant="error">
            {debouncedQuery.trim() ? t('leaderboard.search_empty') : t('leaderboard.empty')}
          </Text>
        )}
      </div>

      {!loading && !error && players.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="hidden sm:grid grid-cols-[3rem_3.5rem_1fr_6rem_5rem_5rem_5rem] items-center gap-3 px-4 border-b border-dim pb-2">
            <span />
            <span />
            <Text size="xs" className="uppercase tracking-widest">
              {t('leaderboard.player_col')}
            </Text>
            <Text size="xs" className="uppercase tracking-widest text-right">
              {t('profile.stat_avg_wpm')}
            </Text>
            <Text size="xs" className="uppercase tracking-widest text-right">
              {t('profile.accuracy_short')}
            </Text>
            <Text size="xs" className="uppercase tracking-widest text-center">
              {t('profile.stat_level')}
            </Text>
            <Text size="xs" className="uppercase tracking-widest text-center">
              {t('profile.stat_played')}
            </Text>
          </div>

          {players.map((item, idx) => (
            <Link
              key={item.username}
              to={`/profile/${item.username}`}
              className="flex sm:grid sm:grid-cols-[3rem_3.5rem_1fr_6rem_5rem_5rem_5rem] items-center gap-3 px-4 py-3 border border-dim hover:border-default transition-colors duration-150 font-mono"
            >
              <Heading level={4} className="text-dim shrink-0 w-10">
                {!debouncedQuery.trim()
                  ? `#${item.rank}`
                  : `${(currentPage - 1) * LIMIT + idx + 1}`}
              </Heading>

              <Avatar username={item.username} src={item.avatarUrl ?? undefined} size="md" />
              <div className="flex flex-col min-w-0 flex-1 sm:hidden">
                <Text className="truncate font-bold">{item.username}</Text>
                <Text size="xs" variant="muted">
                  {item.avgWpm} {t('profile.history_wpm')} · {item.avgAccuracy}% ·{' '}
                  {t('profile.stat_level')} {item.level}
                </Text>
              </div>
              <Text className="truncate font-bold hidden sm:block">{item.username}</Text>

              <Text className="text-right hidden sm:block">
                <span className="font-bold">{item.avgWpm}</span>
                <span className="text-dim text-xs"> {t('profile.history_wpm')}</span>
              </Text>

              <Text className="text-right hidden sm:block">
                <span className="font-bold">{item.avgAccuracy}</span>
                <span className="text-dim text-xs">%</span>
              </Text>

              <Text className="text-center hidden sm:block">
                <span className="font-bold">{item.level}</span>
              </Text>

              <Text className="text-center hidden sm:block">{item.gamesPlayed}</Text>
            </Link>
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </PageLayout>
  );
}
