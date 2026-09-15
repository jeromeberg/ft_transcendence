import { useState } from 'react';
import { Container, Text, Btn } from '@/components';
import type { UserAchievement } from '@/api/users.api';
import { useTranslation } from 'react-i18next';
import type { ContainerVariant } from '@/components/Container';

type Props = {
  achievements: UserAchievement[];
  containerVariant?: ContainerVariant | null;
};

export default function Achievements({ achievements, containerVariant }: Props) {
  const { t } = useTranslation(['pages', 'achievements']);
  const [showAll, setShowAll] = useState(false);

  const unlocked = achievements.filter((a) => a.unlockedAt !== null);
  const visible = showAll ? achievements : unlocked;

  return (
    <Container variant={containerVariant ?? 'default'} label={t('profile.achievements')}>
      {unlocked.length === 0 && !showAll ? (
        <Text variant="muted">{t('profile.no_achievements')}</Text>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {visible.map(({ achievement, unlockedAt }) => {
            const locked = unlockedAt === null;
            return (
              <li
                key={achievement.key}
                className={`flex flex-col gap-1 border border-dim p-3 transition-opacity${locked ? ' opacity-40 grayscale' : ''}`}
              >
                <span className="text-2xl">{locked ? '🔒' : achievement.icon}</span>
                <span className="text-xs font-bold text-default uppercase tracking-wide">
                  {t(`${achievement.key}.label`, {
                    ns: 'achievements',
                    defaultValue: achievement.label,
                  })}
                </span>
                <span className="text-xs text-dim">
                  {t(`${achievement.key}.description`, {
                    ns: 'achievements',
                    defaultValue: achievement.description,
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {achievements.some((a) => a.unlockedAt === null) && (
        <div className="flex justify-end mt-2">
          <Btn size="sm" variant="ghost" onClick={() => setShowAll((v) => !v)}>
            {showAll ? t('profile.achievements_hide_locked') : t('profile.achievements_show_all')}
          </Btn>
        </div>
      )}
    </Container>
  );
}
