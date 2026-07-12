import { useTranslation } from 'react-i18next';

type Props = {
  timeLeft: number;
  wpm: number;
  practice?: boolean;
};

export default function HUD({ timeLeft, wpm, practice = false }: Props) {
  const { t } = useTranslation('pages');
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-between text-sm font-mono text-dim">
      {!practice && (
        <div className="truncate">
          {t('play.hud_time')}:{' '}
          <span className="text-default">
            {mm}:{ss}
          </span>
        </div>
      )}
      <div className="truncate">
        {t('play.hud_wpm')}: <span className="text-default">{wpm}</span>
      </div>
    </div>
  );
}
