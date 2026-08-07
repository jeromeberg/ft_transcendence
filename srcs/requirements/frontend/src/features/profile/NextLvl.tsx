import { Container, ProgressBar } from '@/components';
import type { UserStats } from '@/api/users.api';
import type { ContainerVariant } from '@/components/Container';
import { useTranslation } from 'react-i18next';

interface NextLvlProps {
  stats: UserStats;
  containerVariant?: ContainerVariant | null;
}

const GAMES_PER_LEVEL = 3;

export default function NextLvl({ stats, containerVariant }: NextLvlProps) {
  const { t } = useTranslation('pages');
  const currentLevel = Math.max(1, stats.level);
  const nextLevel = currentLevel + 1;

  const currentLevelGames = (currentLevel - 1) * GAMES_PER_LEVEL;
  const nextLevelGames = (nextLevel - 1) * GAMES_PER_LEVEL;

  const playedSinceCurrentLevel = Math.max(
    0,
    Math.min(stats.gamesPlayed - currentLevelGames, GAMES_PER_LEVEL),
  );

  return (
    <Container variant={containerVariant ?? 'default'} label="NEXT LEVEL">
      <div className="flex flex-col gap-2">
        <ProgressBar
          value={playedSinceCurrentLevel}
          max={GAMES_PER_LEVEL}
          color="dim"
          label={`${stats.gamesPlayed}/${nextLevelGames} ${t('profile.stat_played')}`}
        />
      </div>
    </Container>
  );
}
