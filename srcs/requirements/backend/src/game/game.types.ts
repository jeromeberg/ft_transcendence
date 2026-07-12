export type ParticipantKind = 'user' | 'guest' | 'bot';

export type RoomPhase = 'waiting' | 'countdown' | 'racing' | 'finished';

export type BotState = {
    targetWpm: number;
    charsFloat: number;
    pace: number;
};

export type Participant = {
    pid: string;
    kind: ParticipantKind;
    socketId: string | null;
    userId: number | null;
    username: string;
    avatarUrl: string | null;
    chars: number;
    progress: number;
    wpm: number;
    accuracy: number;
    finished: boolean;
    finishedAt: number | null;
    left?: boolean; // disconnected mid-race: keeps standings slot but is not persisted (unlike timed-out players)
    lastProgressAt?: number;
    bot?: BotState;
};

export type RoomState = {
    id: string;
    matchId: number; // 0 until the Match row is created at race start
    phase: RoomPhase;
    text: string;
    players: Map<string, Participant>;
    hostPid: string | null;
    playerCount: number;
    botTarget: number;
    waitTimer: ReturnType<typeof setTimeout> | null;
    botFillTimer: ReturnType<typeof setTimeout> | null;
    countdownTimer: ReturnType<typeof setTimeout> | null;
    countdownEndsAt: number | null;
    startedAt: number | null;
    raceTimeout: ReturnType<typeof setTimeout> | null;
    botTicker: ReturnType<typeof setTimeout> | null;
};

export type LobbyParticipant = {
    pid: string;
    kind: ParticipantKind;
    username: string;
    avatarUrl: string | null;
};

export type LobbyUpdatePayload = {
    lobbyId: string;
    phase: 'waiting' | 'countdown';
    players: LobbyParticipant[];
    you: string;
    hostPid: string | null;
    text: string;
    countdownEndsAt: number | null;
};

export type RaceStartPayload = {
    roomId: string;
    startedAt: number;
    playerCount: number;
};

export type RaceUpdatePayload = {
    pid: string;
    username: string;
    kind: ParticipantKind;
    progress: number;
    wpm: number;
};

export type RaceResult = {
    pid: string;
    username: string;
    kind: ParticipantKind;
    position: number;
    wpm: number;
};

export type RaceFinishedPayload = {
    results: RaceResult[];
    playerCount: number;
};

export type YouFinishedPayload = {
    position: number;
    playerCount: number;
};
