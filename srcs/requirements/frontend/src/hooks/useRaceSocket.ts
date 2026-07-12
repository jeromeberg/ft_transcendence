import { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore
import { io, Socket } from 'socket.io-client';
import { getToken } from '@/features/auth';
import type {
  ParticipantKind,
  LobbyUpdatePayload,
  RaceStartPayload,
  RaceUpdatePayload,
  RaceFinishedPayload,
  YouFinishedPayload,
  RaceResult,
} from '@backend/game/game.types';

export type {
  ParticipantKind,
  LobbyParticipant,
  RaceResult,
  RaceStartPayload,
  RaceFinishedPayload,
} from '@backend/game/game.types';

export type Racer = {
  pid: string;
  username: string;
  kind: ParticipantKind;
  avatarUrl: string | null;
  progress: number;
  wpm: number;
};

export type RacePhase = 'idle' | 'waiting' | 'countdown' | 'racing' | 'finished';

export type RaceRewards = {
  newAchievements: { key: string; label: string; description: string; icon: string }[];
  newLevel: number | null;
};

export function useRaceSocket() {
  const socketRef = useRef<Socket | null>(null);
  const raceStartClientRef = useRef<number | null>(null); // client-side start time for latency-free finish timing
  const phaseRef = useRef<RacePhase>('idle');
  const finishedRef = useRef(false);

  const [phase, setPhase] = useState<RacePhase>('idle');
  const [connected, setConnected] = useState(false);
  const [you, setYou] = useState<string | null>(null);
  const [matchText, setMatchText] = useState<string | null>(null);
  const [countdownEndsAt, setCountdownEndsAt] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [racers, setRacers] = useState<Record<string, Racer>>({});
  const [finishOrder, setFinishOrder] = useState<string[]>([]);
  const [results, setResults] = useState<RaceResult[] | null>(null);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [rejected, setRejected] = useState<string | null>(null);
  const [disconnected, setDisconnected] = useState(false);
  const [rewards, setRewards] = useState<RaceRewards | null>(null);

  const teardown = useCallback(() => {
    const s = socketRef.current;
    if (s) {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    }
    setConnected(false);
  }, []);

  const resetState = useCallback(() => {
    setPhase('idle');
    setYou(null);
    setMatchText(null);
    setCountdownEndsAt(null);
    setStartedAt(null);
    setPlayerCount(0);
    setRacers({});
    setFinishOrder([]);
    setResults(null);
    setMyPosition(null);
    setRejected(null);
    setDisconnected(false);
  }, []);

  const joinQueue = useCallback(() => {
    teardown();
    resetState();
    raceStartClientRef.current = null;
    finishedRef.current = false;

    const token = getToken();
    const socket: Socket = io('/game', {
      auth: token ? { token } : { guest: true },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setPhase('waiting');
      socket.emit('join_queue');
    });

    socket.on('connect_error', (err: any) => {
      console.error('Game socket connect_error:', err);
    });

    socket.on('disconnect', (reason: string) => {
      setConnected(false);
      if (reason === 'io client disconnect') {
        return;
      }
      if (phaseRef.current !== 'racing' || finishedRef.current) {
        return;
      }
      setDisconnected(true);
      teardown();
    });

    socket.on('join_rejected', (payload: { reason: string }) => {
      setRejected(payload?.reason ?? 'rejected');
      setPhase('idle');
      teardown();
    });

    socket.on('lobby_update', (payload: LobbyUpdatePayload) => {
      setYou(payload.you);
      setMatchText(payload.text);
      setCountdownEndsAt(payload.phase === 'countdown' ? payload.countdownEndsAt : null);
      setPhase(payload.phase === 'countdown' ? 'countdown' : 'waiting');
      setRacers((prev) => {
        const next: Record<string, Racer> = {};
        for (const p of payload.players) {
          next[p.pid] = prev[p.pid] ?? {
            pid: p.pid,
            username: p.username,
            kind: p.kind,
            avatarUrl: p.avatarUrl,
            progress: 0,
            wpm: 0,
          };
        }
        return next;
      });
    });

    socket.on('race_start', (payload: RaceStartPayload) => {
      raceStartClientRef.current = Date.now();
      setStartedAt(payload.startedAt);
      setPlayerCount(payload.playerCount);
      setCountdownEndsAt(null);
      setPhase('racing');
    });

    socket.on('you_finished', (payload: YouFinishedPayload) => {
      finishedRef.current = true;
      setMyPosition(payload.position);
      setPlayerCount(payload.playerCount);
    });

    socket.on('race_update', (payload: RaceUpdatePayload) => {
      setRacers((prev) => ({
        ...prev,
        [payload.pid]: {
          pid: payload.pid,
          username: payload.username,
          kind: payload.kind,
          avatarUrl: prev[payload.pid]?.avatarUrl ?? null,
          progress: payload.progress,
          wpm: payload.wpm,
        },
      }));
      if (payload.progress >= 1) {
        setFinishOrder((prev) => (prev.includes(payload.pid) ? prev : [...prev, payload.pid]));
      }
    });

    socket.on('race_finished', (payload: RaceFinishedPayload) => {
      setResults(payload.results);
      setPlayerCount(payload.playerCount);
      setPhase('finished');
    });

    socket.on('race_rewards', (payload: RaceRewards) => {
      setRewards(payload);
    });
  }, [teardown, resetState]);

  const leaveQueue = useCallback(() => {
    const s = socketRef.current;
    if (s && s.connected) s.emit('leave_queue');
    teardown();
    resetState();
  }, [teardown, resetState]);

  const sendProgress = useCallback((chars: number, accuracy: number) => {
    const s = socketRef.current;
    if (!s || !s.connected) return;
    const durationMs =
      raceStartClientRef.current != null ? Date.now() - raceStartClientRef.current : 0;
    s.emit('player_progress', { chars, accuracy, durationMs });
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(
    () => () => {
      teardown();
    },
    [teardown],
  );

  return {
    phase,
    connected,
    you,
    matchText,
    countdownEndsAt,
    startedAt,
    playerCount,
    racers,
    finishOrder,
    results,
    myPosition,
    rejected,
    disconnected,
    rewards,
    clearRewards: () => setRewards(null),
    joinQueue,
    leaveQueue,
    sendProgress,
  };
}
