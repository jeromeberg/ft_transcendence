import { useTranslation } from 'react-i18next';
import { StatCard, StatItem, StatDivider } from '@/components';
import type { UserStats } from '@/api/users.api';
import type { ContainerVariant } from '@/components/Container';

interface StatsProps {
  stats: UserStats;
  containerVariant?: ContainerVariant | null;
}

export default function Stats({ stats, containerVariant }: StatsProps) {
  const { t } = useTranslation('pages');

  return (
    <StatCard label={t('profile.stats_label')} variant={containerVariant ?? 'default'}>
      <StatItem label={t('profile.stat_rank')} value={`#${stats.rank}`} accent />
      <StatDivider />
      <StatItem label={t('profile.stat_avg_wpm')} value={String(stats.avgWpm)} />
      <StatDivider />
      <StatItem label={t('profile.stat_level')} value={String(stats.level)} />
      <StatDivider />
      <StatItem label={t('profile.stat_played')} value={String(stats.gamesPlayed)} />
    </StatCard>
  );
}
