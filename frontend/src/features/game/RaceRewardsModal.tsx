import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Btn } from '@/components';
import { useTranslation } from 'react-i18next';
import type { RaceRewards } from '@/hooks/useRaceSocket';

function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotSpeed: number;
  };
  const colors = ['#00ff41', '#ffffff', '#a0ffa0', '#ffff00', '#ff6600', '#00ccff'];
  const particles: Particle[] = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 60,
    vx: (Math.random() - 0.5) * 3,
    vy: 1.5 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 5 + Math.random() * 7,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
  }));

  let rafId: number;
  function draw() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    let allGone = true;
    for (const p of particles) {
      if (p.y < canvas.height + 20) allGone = false;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx!.restore();
    }
    if (!allGone) rafId = requestAnimationFrame(draw);
  }
  draw();
  return () => cancelAnimationFrame(rafId);
}

type Props = {
  rewards: RaceRewards;
  onClose: () => void;
};

export default function RaceRewardsModal({ rewards, onClose }: Props) {
  const { t } = useTranslation(['pages', 'achievements']);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    function fire() {
      if (!canvasRef.current) return;
      if (stopRef.current) stopRef.current();
      stopRef.current = launchConfetti(canvasRef.current);
    }
    fire();
    intervalRef.current = setInterval(fire, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stopRef.current) stopRef.current();
    };
  }, []);

  const hasAchievements = rewards.newAchievements.length > 0;

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
      <div className="relative flex flex-col gap-6 text-center z-10">
        {rewards.newLevel !== null && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">⬆️</span>
            <p className="font-mono text-xs text-dim uppercase tracking-widest">
              {t('play.rewards_level_up', { ns: 'pages' })}
            </p>
            <p className="font-mono text-5xl font-bold text-default">
              {t('play.rewards_level', { ns: 'pages', level: rewards.newLevel })}
            </p>
          </div>
        )}

        {hasAchievements && (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs text-dim uppercase tracking-widest">
              {rewards.newAchievements.length === 1
                ? t('play.rewards_achievement', { ns: 'pages' })
                : t('play.rewards_achievements', {
                    ns: 'pages',
                    count: rewards.newAchievements.length,
                  })}
            </p>
            <ul className="flex flex-col gap-2">
              {rewards.newAchievements.map((a) => (
                <li
                  key={a.key}
                  className="flex items-center gap-3 border border-default p-3 bg-black/40"
                >
                  <span className="text-3xl shrink-0">{a.icon}</span>
                  <div className="flex flex-col items-start text-left min-w-0">
                    <span className="text-xs font-bold text-default uppercase tracking-wide truncate w-full">
                      {t(`${a.key}.label`, { ns: 'achievements', defaultValue: a.label })}
                    </span>
                    <span className="text-xs text-dim truncate w-full">
                      {t(`${a.key}.description`, {
                        ns: 'achievements',
                        defaultValue: a.description,
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Btn variant="ghost" size="sm" onClick={onClose}>
            {t('play.rewards_continue', { ns: 'pages' })}
          </Btn>
          <Btn
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              navigate('/profile');
            }}
          >
            {t('play.rewards_go_profile', { ns: 'pages' })}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
