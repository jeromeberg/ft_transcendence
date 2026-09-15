import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MatrixRain, PillButton } from '@/components';

export default function Home() {
  const { t } = useTranslation('pages');
  const navigate = useNavigate();

  return (
    <div className="no-background relative flex-1 flex items-center justify-center overflow-hidden">
      <MatrixRain />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-10 py-10 bg-black/90">
        <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-default" />
        <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-default" />
        <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-default" />
        <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-default" />
        <div className="flex flex-col gap-2">
          <h1
            className="text-5xl sm:text-8xl font-bold font-mono tracking-[0.3em] uppercase text-default"
            style={{ textShadow: '0 0 20px currentColor, 0 0 40px currentColor' }}
          >
            TYPERUN
          </h1>
          <p className="text-dim font-mono text-sm tracking-widest uppercase">
            {t('play.race_description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <PillButton
            color="red"
            onClick={() => navigate('/play/multiplayer', { state: { fromApp: true } })}
          >
            {t('play.enter_race')}
          </PillButton>
          <PillButton color="blue" onClick={() => navigate('/play/practice')}>
            {t('play.practice_mode')}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
