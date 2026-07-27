import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Car from './Car';
import { CAR_COUNT } from './carPalettes';
import type { Racer, RaceResult } from '@/hooks/useRaceSocket';

const LANES = [0, 1, 2];
const SEGMENT_DURATION = 2;

type Waypoint = { t: number; p: number };

function randomUniqueVariants(count: number): number[] {
  const pool = Array.from({ length: CAR_COUNT }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function buildCurve(targetWpm: number, passageLength: number): Waypoint[] {
  const charsPerSec = (targetWpm * 5) / 60;
  const curve: Waypoint[] = [{ t: 0, p: 0 }];
  let chars = 0;
  while (chars < passageLength) {
    const multiplier = 0.6 + Math.random() * 0.8;
    chars += charsPerSec * SEGMENT_DURATION * multiplier;
    const t = curve[curve.length - 1].t + SEGMENT_DURATION;
    const p = Math.min(1, chars / passageLength);
    curve.push({ t, p });
    if (p >= 1) break;
  }
  return curve;
}

function interpolate(curve: Waypoint[], elapsed: number): number {
  if (elapsed <= 0) return 0;
  const last = curve[curve.length - 1];
  if (elapsed >= last.t) return last.p;
  for (let i = 1; i < curve.length; i++) {
    if (elapsed <= curve[i].t) {
      const a = curve[i - 1],
        b = curve[i];
      return a.p + ((elapsed - a.t) / (b.t - a.t)) * (b.p - a.p);
    }
  }
  return 1;
}

function segmentWpm(curve: Waypoint[], elapsed: number, passageLength: number): number {
  for (let i = 1; i < curve.length; i++) {
    if (elapsed <= curve[i].t) {
      const a = curve[i - 1],
        b = curve[i];
      const charsPerSec = ((b.p - a.p) * passageLength) / (b.t - a.t);
      return Math.round((charsPerSec * 60) / 5);
    }
  }
  return 0;
}

function finishedWpm(curve: Waypoint[], passageLength: number): number {
  const t = curve[curve.length - 1].t;
  return t > 0 ? Math.round(passageLength / 5 / (t / 60)) : 0;
}

type Props = {
  multiplayer?: boolean;
  racers?: Racer[];
  youPid?: string | null;
  finishOrder?: string[];
  results?: RaceResult[] | null;
  playerProgress: number;
  playerWpm: number;
  elapsed: number;
  active: boolean;
  passageLength: number;
  practice?: boolean;
  onFinishOrderChange?: (order: number[]) => void;
};

export default function RaceTrack(props: Props) {
  if (props.multiplayer) return <MultiplayerTrack {...props} />;
  return <CosmeticTrack {...props} />;
}

function MultiplayerTrack({
  racers = [],
  youPid,
  finishOrder = [],
  results,
  passageLength,
  elapsed,
  playerWpm,
  playerProgress,
}: Props) {
  const { t } = useTranslation('pages');
  const ordinals = t('play.ordinals', { returnObjects: true }) as string[];
  const ordinal = (place: number): string => ordinals[place - 1] ?? `${place}th`;

  // Derive each car's variant from the server-assigned pid (sorted) so every client maps the same
  // car to the same player; unique up to CAR_COUNT, then wraps.
  const variantByPid = useMemo(() => {
    const map = new Map<string, number>();
    [...racers]
      .map((r) => r.pid)
      .sort()
      .forEach((pid, i) => map.set(pid, i % CAR_COUNT));
    return map;
  }, [racers]);

  // Three sources, in priority order: server results (authoritative once race ends),
  // local engine for own car (matches HUD exactly), derived from progress+clock for
  // live opponents (decays when they stall, unlike the frozen race_update snapshot).
  const finalWpm = results ? new Map(results.map((r) => [r.pid, r.wpm])) : null;
  const wpmFor = (r: Racer): number => {
    const settled = finalWpm?.get(r.pid);
    if (settled != null) return Math.round(settled);
    if (r.pid === youPid) return Math.round(playerWpm);
    if (r.progress >= 1) return Math.round(r.wpm);
    const minutes = elapsed / 60;
    return minutes > 0 ? Math.round((r.progress * passageLength) / 5 / minutes) : 0;
  };

  const finalPlace = results ? new Map(results.map((r) => [r.pid, r.position])) : null;
  const placeFor = (pid: string): string | null => {
    if (finalPlace) {
      const pos = finalPlace.get(pid);
      return pos != null ? ordinal(pos) : null;
    }
    const i = finishOrder.indexOf(pid);
    return i >= 0 ? ordinal(i + 1) : null;
  };

  return (
    <div className="w-full">
      {racers.map((r) => {
        const isYou = r.pid === youPid;
        const place = placeFor(r.pid);
        return (
          <div key={r.pid} className="flex items-center h-12 mb-1.5">
            <div className="w-20 sm:w-32 text-right pr-3 sm:pr-4 text-sm truncate flex flex-col items-end justify-center">
              <span className={isYou ? 'text-default font-bold' : 'text-dim'}>
                {r.kind === 'user'
                  ? r.username
                  : r.kind === 'bot'
                    ? t('play.bot')
                    : t('play.guest')}
              </span>
              {isYou && <span className="text-xs text-dim">({t('play.you')})</span>}
            </div>

            <div className="flex-1 relative">
              <div className="bg-black/30 h-10 rounded-md relative overflow-hidden">
                <Car
                  progress={isYou ? playerProgress : r.progress}
                  variant={variantByPid.get(r.pid) ?? 0}
                />
              </div>
            </div>

            <div className="w-14 sm:w-20 pl-2 sm:pl-3 font-mono text-right flex flex-col items-end">
              {place && <span className="text-xs text-dim uppercase tracking-widest">{place}</span>}
              <span className="text-xs sm:text-sm text-default">{wpmFor(r)} WPM</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CosmeticTrack({
  playerProgress,
  playerWpm,
  elapsed,
  active,
  passageLength,
  practice = false,
  onFinishOrderChange,
}: Props) {
  const lanes = practice ? [0] : LANES;
  const [variants] = useState<number[]>(() => randomUniqueVariants(LANES.length));
  const [botTargetWpms] = useState<number[]>(() =>
    [1, 2].map(() => Math.round(40 + Math.random() * 40)),
  );
  const [botCurves] = useState<Waypoint[][]>(() =>
    botTargetWpms.map((wpm: number) => buildCurve(wpm, passageLength)),
  );
  const [finishOrder, setFinishOrder] = useState<number[]>([]);

  const progressForLane = (idx: number): number => {
    if (idx === 0) return playerProgress;
    return active ? interpolate(botCurves[idx - 1], elapsed) : 0;
  };

  const wpmForLane = (idx: number): number => {
    if (idx === 0) return playerWpm;
    if (!active || elapsed < 1) return 0;
    if (progressForLane(idx) >= 1) return finishedWpm(botCurves[idx - 1], passageLength);
    return segmentWpm(botCurves[idx - 1], elapsed, passageLength);
  };

  useEffect(() => {
    if (!active) return;
    setFinishOrder((prev: number[]) => {
      const next = [...prev];
      lanes.forEach((idx) => {
        const p = idx === 0 ? playerProgress : interpolate(botCurves[idx - 1], elapsed);
        if (p >= 1 && !next.includes(idx)) next.push(idx);
      });
      return next.length === prev.length ? prev : next;
    });
  }, [elapsed, playerProgress, active]);

  useEffect(() => {
    onFinishOrderChange?.(finishOrder);
  }, [finishOrder]);

  const { t } = useTranslation('pages');
  const ordinals = t('play.ordinals', { returnObjects: true }) as string[];
  const label = (idx: number) => (idx === 0 ? t('play.you') : t('play.player', { n: idx + 1 }));
  const place = (idx: number) => {
    const i = finishOrder.indexOf(idx);
    return i >= 0 ? (ordinals[i] ?? null) : null;
  };

  return (
    <div className="w-full">
      {lanes.map((idx) => (
        <div key={idx} className="flex items-center h-12 mb-1.5">
          <div className="w-16 sm:w-28 text-right pr-3 sm:pr-4 text-sm text-dim truncate">
            {label(idx)}
          </div>

          <div className="flex-1 relative">
            <div className="bg-black/30 h-10 rounded-md relative overflow-hidden">
              <Car progress={progressForLane(idx)} variant={variants[idx]} />
            </div>
          </div>

          <div className="w-14 sm:w-20 pl-2 sm:pl-3 font-mono text-right flex flex-col items-end">
            {place(idx) && (
              <span className="text-xs text-dim uppercase tracking-widest">{place(idx)}</span>
            )}
            <span className="text-xs sm:text-sm text-default">{wpmForLane(idx)} WPM</span>
          </div>
        </div>
      ))}
    </div>
  );
}
