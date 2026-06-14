import { Injectable } from '@nestjs/common';
import { Namespace } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatus, UserStatus } from '@prisma/client';
import {
	MAX_PLAYERS,
	MAX_WPM,
	MIN_RACE_SECONDS,
	MIN_CHARS_PER_SEC,
	LOBBY_WAIT_MS,
	LOBBY_COUNTDOWN_MS,
	LOBBY_JOIN_LOCK_MS,
	BOT_FILL_INTERVAL_MS,
	BOT_TICK_MS,
	PROGRESS_MIN_INTERVAL_MS,
} from '../common/game.constant';
import { AchievementService } from '../achievement/achievement.service';
import { QuoteService } from '../quote/quote.service';
import { BotService } from './bot.service';
import {
	Participant,
	ParticipantKind,
	RoomState,
	LobbyParticipant,
	RaceResult,
} from './game.types';

export type JoinInput = {
	socketId: string;
	kind: 'user' | 'guest';
	userId: number | null;
	username: string;
	avatarUrl: string | null;
};

export type AssignResult =
	| { status: 'joined'; room: RoomState }
	| { status: 'busy' }
	| { status: 'duplicate_session' };

function generateRoomID(): string {
	return Math.random().toString(36).substring(2, 7).toUpperCase();
}

@Injectable()
export class GameService {
	constructor(
		private prisma: PrismaService,
		private achievementService: AchievementService,
		private quoteService: QuoteService,
		private botService: BotService,
	) {}

	private server!: Namespace;
	private rooms = new Map<string, RoomState>();
	private socketToRoom = new Map<string, string>();
	private finalizing = new Set<string>();
	private botSeq = 0;

	setServer(server: Namespace): void {
		this.server = server;
	}

	isInRoom(socketId: string): boolean {
		return this.socketToRoom.has(socketId);
	}

	private roomOf(socketId: string): RoomState | undefined {
		const id = this.socketToRoom.get(socketId);
		return id ? this.rooms.get(id) : undefined;
	}

	private participantOf(room: RoomState, socketId: string): Participant | undefined {
		for (const p of room.players.values())
			if (p.socketId === socketId) return p;
		return undefined;
	}

	private humanCount(room: RoomState): number {
		let n = 0;
		for (const p of room.players.values()) if (p.kind !== 'bot') n++;
		return n;
	}

	private botCount(room: RoomState): number {
		let n = 0;
		for (const p of room.players.values()) if (p.kind === 'bot') n++;
		return n;
	}

	private connectedHumanCount(room: RoomState): number {
		let n = 0;
		for (const p of room.players.values())
			if (p.kind !== 'bot' && p.socketId !== null) n++;
		return n;
	}

	private userInRoom(userId: number): boolean {
		for (const room of this.rooms.values())
			for (const p of room.players.values())
				if (p.kind === 'user' && p.userId === userId && p.socketId !== null)
					return true;
		return false;
	}

	private makePid(kind: ParticipantKind, userId: number | null): string {
		if (kind === 'user') return `u${userId}`;
		if (kind === 'guest') return `g${Math.random().toString(36).slice(2, 9)}`;
		return `b${++this.botSeq}`;
	}

	async assign(input: JoinInput): Promise<AssignResult> {
		if (this.isInRoom(input.socketId)) return { status: 'busy' };
		if (input.kind === 'user' && input.userId != null && this.userInRoom(input.userId))
			return { status: 'duplicate_session' };

		const participant: Participant = {
			pid: this.makePid(input.kind, input.userId),
			kind: input.kind,
			socketId: input.socketId,
			userId: input.userId,
			username: input.username,
			avatarUrl: input.avatarUrl,
			chars: 0,
			progress: 0,
			wpm: 0,
			accuracy: 0,
			finished: false,
			finishedAt: null,
		};

		const existing = this.findJoinableRoom();
		if (!existing) {
			const room = await this.createRoom(participant);
			this.emitLobbyUpdate(room);
			return { status: 'joined', room };
		}

		this.addParticipant(existing, participant);
		if (existing.phase === 'waiting' && this.humanCount(existing) >= 2)
			this.startCountdown(existing);
		else
			this.emitLobbyUpdate(existing);
		return { status: 'joined', room: existing };
	}

	private findJoinableRoom(): RoomState | undefined {
		const now = Date.now();
		const eligible = [...this.rooms.values()].filter((r) => {
			const openPhase =
				r.phase === 'waiting' ||
				(r.phase === 'countdown' &&
					r.countdownEndsAt != null &&
					r.countdownEndsAt - now > LOBBY_JOIN_LOCK_MS);
			return openPhase && this.humanCount(r) < MAX_PLAYERS;
		});
		eligible.sort((a, b) => {
			const byHumans = this.humanCount(b) - this.humanCount(a);
			if (byHumans !== 0) return byHumans;
			return b.players.size - a.players.size;
		});
		return eligible[0];
	}

	private async createRoom(host: Participant): Promise<RoomState> {
		const quote = await this.quoteService.getRandomQuote();
		const room: RoomState = {
			id: generateRoomID(),
			matchId: 0,
			phase: 'waiting',
			text: quote.text,
			players: new Map([[host.pid, host]]),
			hostPid: host.pid,
			playerCount: 0,
			botTarget: 0,
			waitTimer: null,
			botFillTimer: null,
			countdownTimer: null,
			countdownEndsAt: null,
			startedAt: null,
			raceTimeout: null,
			botTicker: null,
		};
		this.rooms.set(room.id, room);
		if (host.socketId) this.socketToRoom.set(host.socketId, room.id);

		room.botTarget = this.botTargetFor(this.humanCount(room));
		room.waitTimer = setTimeout(() => this.onWaitTimeout(room.id), LOBBY_WAIT_MS);
		this.scheduleBotFill(room);
		console.log(`[Lobby][${room.id}] created by ${host.username}`);
		return room;
	}

	private addParticipant(room: RoomState, p: Participant): void {
		if (room.players.size >= MAX_PLAYERS) this.evictBot(room);
		room.players.set(p.pid, p);
		if (p.socketId) this.socketToRoom.set(p.socketId, room.id);
		this.repadBots(room);
	}

	private evictBot(room: RoomState): boolean {
		for (const p of room.players.values()) {
			if (p.kind === 'bot') {
				room.players.delete(p.pid);
				console.log(`[Lobby][${room.id}] evicted bot ${p.pid}`);
				return true;
			}
		}
		return false;
	}

	private botTargetFor(humanCount: number): number {
		return Math.max(0, MAX_PLAYERS - humanCount);
	}

	private repadBots(room: RoomState): void {
		room.botTarget = this.botTargetFor(this.humanCount(room));
		while (
			(this.botCount(room) > room.botTarget || room.players.size > MAX_PLAYERS) &&
			this.evictBot(room)
		);
	}

	private fillBotsNow(room: RoomState): void {
		while (this.botCount(room) < room.botTarget && room.players.size < MAX_PLAYERS) {
			this.addBot(room);
		}
	}

	private addBot(room: RoomState): void {
		const pid = this.makePid('bot', null);
		room.players.set(pid, {
			pid,
			kind: 'bot',
			socketId: null,
			userId: null,
			username: `Bot ${pid.slice(1)}`,
			avatarUrl: null,
			chars: 0,
			progress: 0,
			wpm: 0,
			accuracy: 0,
			finished: false,
			finishedAt: null,
		});
	}

	private scheduleBotFill(room: RoomState): void {
		if (room.botFillTimer)
			return;
		room.botFillTimer = setInterval(() => this.botFillTick(room.id), BOT_FILL_INTERVAL_MS);
	}

	private stopBotFill(room: RoomState): void {
		if (room.botFillTimer) {
			clearInterval(room.botFillTimer);
			room.botFillTimer = null;
		}
	}

	private botFillTick(roomId: string): void {
		const room = this.rooms.get(roomId);
		if (!room) return;
		if (room.phase !== 'waiting' && room.phase !== 'countdown') {
			this.stopBotFill(room);
			return;
		}
		if (this.botCount(room) >= room.botTarget || room.players.size >= MAX_PLAYERS) return;
		this.addBot(room);
		this.emitLobbyUpdate(room);
	}

	private onWaitTimeout(roomId: string): void {
		const room = this.rooms.get(roomId);
		if (!room || room.phase !== 'waiting') return;
		room.waitTimer = null;
		this.startCountdown(room);
	}

	private startCountdown(room: RoomState): void {
		if (room.waitTimer) {
			clearTimeout(room.waitTimer);
			room.waitTimer = null;
		}
		room.phase = 'countdown';
		room.countdownEndsAt = Date.now() + LOBBY_COUNTDOWN_MS;
		room.countdownTimer = setTimeout(
			() => this.onCountdownEnd(room.id),
			LOBBY_COUNTDOWN_MS,
		);
		this.emitLobbyUpdate(room);
	}

	private onCountdownEnd(roomId: string): void {
		const room = this.rooms.get(roomId);
		if (!room || room.phase !== 'countdown') return;
		void this.startRace(room);
	}

	private async startRace(room: RoomState): Promise<void> {
		if (room.countdownTimer) {
			clearTimeout(room.countdownTimer);
			room.countdownTimer = null;
		}
		this.stopBotFill(room);
		room.countdownEndsAt = null;
		room.phase = 'racing';
		room.startedAt = Date.now();
		room.playerCount = room.players.size;

		const userIds = this.userIdsOf(room);
		// DB failure must not strand the room: race runs unranked (matchId stays 0) rather
		// than leaving clients on a frozen countdown with no timers armed.
		try {
			const match = await this.prisma.match.create({
				data: {
					quote: {
						create: {
							active: true,
							text: room.text,
						},
					},
					startedAt: new Date(),
					status: MatchStatus.IN_PROGRESS,
				},
			});
			room.matchId = match.id;

			if (userIds.length > 0) {
				await this.prisma.user.updateMany({
					where: { id: { in: userIds } },
					data: { status: UserStatus.IN_GAME },
				});
			}
		} catch (err) {
			console.error(`[Race][${room.id}] start persistence failed; running unranked`, err);
		}

		let anchor: number;
		try {
			anchor = await this.botService.anchorWpm(userIds);
		} catch (err) {
			console.error(`[Race][${room.id}] anchorWpm failed; using fallback`, err);
			anchor = await this.botService.anchorWpm([]);
		}
		this.botService.initBots(room, anchor);

		this.server.to(room.id).emit('race_start', {
			roomId: room.id,
			startedAt: room.startedAt,
			playerCount: room.playerCount,
		});

		const maxMs =
			Math.max(MIN_RACE_SECONDS, Math.ceil(room.text.length / MIN_CHARS_PER_SEC)) * 1000;
		room.raceTimeout = setTimeout(() => void this.forceFinish(room.id), maxMs);
		room.botTicker = setInterval(() => this.botTick(room.id), BOT_TICK_MS);

		console.log(
			`[Race][${room.id}] started / ${room.playerCount} racers (${userIds.length} users)`,
		);
	}

	private botTick(roomId: string): void {
		const room = this.rooms.get(roomId);
		if (!room || room.phase !== 'racing') return;

		for (const bot of this.botService.step(room)) {
			if (bot.finished) bot.wpm = this.calcWpm(bot.chars, room.startedAt!);
			this.server.to(room.id).emit('race_update', {
				pid: bot.pid,
				username: bot.username,
				kind: bot.kind,
				progress: bot.progress,
				wpm: bot.wpm,
			});
		}
		if (this.allFinished(room)) void this.finalizeRace(room.id);
	}

	updateProgress(
		socketId: string,
		chars: number,
		durationMs?: number,
		accuracy?: number,
	): { roomId: string; pid: string; username: string; kind: ParticipantKind; progress: number; wpm: number } | null {
		const room = this.roomOf(socketId);
		if (!room || room.phase !== 'racing' || !room.startedAt) return null;

		const p = this.participantOf(room, socketId);
		if (!p || p.finished) return null;

		if (chars < p.chars) return null;

		const now = Date.now();
		const len = room.text.length;
		// Anti-cheat: chars can't exceed what MAX_WPM allows for the elapsed time.
		const maxReachable = Math.ceil(((now - room.startedAt) / 1000) * (MAX_WPM * 5 / 60));
		const safe = Math.min(chars, len, maxReachable);
		const isFinish = len > 0 && safe >= len;

		if (!isFinish && p.lastProgressAt != null && now - p.lastProgressAt < PROGRESS_MIN_INTERVAL_MS)
			return null;
		p.lastProgressAt = now;

		p.chars = safe;
		p.progress = len > 0 ? safe / len : 1;
		if (accuracy != null) p.accuracy = Math.max(0, Math.min(100, accuracy));

		if (isFinish) {
			// Use the client's own elapsed time (latency-free finish), clamped between
			// the server's observed duration and the minimum a MAX_WPM typist could achieve.
			const minDurationMs = (len / 5) / MAX_WPM * 60000;
			const serverElapsedMs = now - room.startedAt;
			let dur = durationMs && durationMs > 0 ? durationMs : serverElapsedMs;
			dur = Math.min(dur, serverElapsedMs);
			dur = Math.max(dur, minDurationMs);
			p.wpm = Math.round((len / 5) / (dur / 60000));
		}

		return {
			roomId: room.id,
			pid: p.pid,
			username: p.username,
			kind: p.kind,
			progress: p.progress,
			wpm: p.wpm,
		};
	}

	handleFinish(socketId: string): { roomId: string; allDone: boolean; position: number; playerCount: number } | null {
		const room = this.roomOf(socketId);
		if (!room || room.phase !== 'racing') return null;

		const p = this.participantOf(room, socketId);
		if (!p || p.finished) return null;

		p.finished = true;
		p.finishedAt = Date.now();
		p.progress = 1;

		const position = [...room.players.values()].filter(x => x.finishedAt != null).length;
		const allDone = this.allFinished(room);
		if (allDone) room.phase = 'finished';
		return { roomId: room.id, allDone, position, playerCount: room.playerCount };
	}

	private allFinished(room: RoomState): boolean {
		for (const p of room.players.values()) if (!p.finished) return false;
		return true;
	}

	async forceFinish(roomId: string): Promise<void> {
		const room = this.rooms.get(roomId);
		if (!room || room.phase === 'finished') {
			return;
		}

		const endedAt = Date.now();
		let position = [...room.players.values()].filter((p) => p.finishedAt != null).length;
		const pending = [...room.players.values()]
			.filter((p) => p.finishedAt == null)
			.sort((a, b) => b.progress - a.progress);

		for (const p of pending) {
			p.finished = true;
			p.finishedAt = endedAt;
			if (room.startedAt) {
				p.wpm = this.calcWpm(p.chars, room.startedAt);
			}
			await this.completePlayer(room, p, ++position);
		}

		room.phase = 'finished';
		await this.finalizeRace(roomId);
	}

	async recordFinish(socketId: string, position: number): Promise<{ newAchievements: { key: string; label: string; description: string; icon: string }[]; newLevel: number | null } | null> {
		const room = this.roomOf(socketId);
		if (!room) {
			return null;
		}
		const p = this.participantOf(room, socketId);
		if (!p) {
			return null;
		}
		return this.completePlayer(room, p, position);
	}

	private async completePlayer(room: RoomState, p: Participant, position: number): Promise<{ newAchievements: { key: string; label: string; description: string; icon: string }[]; newLevel: number | null } | null> {
		if (p.kind !== 'user' || p.userId == null || p.left) {
			return null;
		}
		if (room.matchId === 0) {
			return null;
		}

		const nbBots = [...room.players.values()].filter((x) => x.kind === 'bot').length;
		const nbPlayers = room.players.size - nbBots;

		try {
			const result = await this.prisma.matchResult.upsert({
				where: { matchId_userId: { matchId: room.matchId, userId: p.userId } },
				update: {},
				create: {
					matchId: room.matchId,
					userId: p.userId,
					kind: 'user',
					displayName: p.username,
					avatarUrl: p.avatarUrl,
					wpm: p.wpm > MAX_WPM ? 0 : p.wpm,
					accuracy: p.accuracy,
					position,
					finishedAt: p.finishedAt ? new Date(p.finishedAt) : null,
					nbPlayers,
					nbBots,
				},
			});
			return await this.achievementService.checkAndUnlockAchievements(p.userId, result);
		} catch (err) {
			console.error(`[Race][${room.id}] finish persistence for ${p.username} failed`, err);
			return null;
		}
	}

	async finalizeRace(roomId: string): Promise<void> {
		const room = this.rooms.get(roomId);
		if (!room)
			return;
		if (this.finalizing.has(roomId))
			return;
		this.finalizing.add(roomId);
		room.phase = 'finished';
		if (room.botTicker) {
			clearInterval(room.botTicker);
			room.botTicker = null;
		}

		const sorted = [...room.players.values()].sort((a, b) => {
			const fa = a.finishedAt ?? Infinity;
			const fb = b.finishedAt ?? Infinity;
			if (fa !== fb) {
				return fa - fb;
			}
			return b.progress - a.progress;
		});

		if (room.startedAt) {
			for (const p of room.players.values()) {
				if (p.finishedAt == null) {
					p.wpm = this.calcWpm(p.chars, room.startedAt);
				}
			}
		}

		const results: RaceResult[] = sorted.map((p, i) => ({
			pid: p.pid,
			username: p.username,
			kind: p.kind,
			position: i + 1,
			wpm: p.wpm > MAX_WPM ? 0 : p.wpm,
		}));

		try {
			if (room.matchId !== 0) {
				await this.prisma.match.update({
					where: { id: room.matchId },
					data: { endedAt: new Date(), status: MatchStatus.FINISHED },
				});

				// Bots and guests have no User row, so completePlayer skips them; record their
				// roster rows here (userId null) so the match history shows the full field.
				const nbBots = sorted.filter((x) => x.kind === 'bot').length;
				const nbPlayers = sorted.length - nbBots;
				const nonUsers = sorted
					.map((p, i) => ({ p, position: i + 1 }))
					.filter(({ p }) => p.kind !== 'user');
				if (nonUsers.length > 0) {
					await this.prisma.matchResult.createMany({
						data: nonUsers.map(({ p, position }) => ({
							matchId: room.matchId,
							userId: null,
							kind: p.kind,
							displayName: p.username,
							avatarUrl: p.avatarUrl,
							wpm: p.wpm > MAX_WPM ? 0 : p.wpm,
							accuracy: p.accuracy,
							position,
							finishedAt: p.finishedAt ? new Date(p.finishedAt) : null,
							nbPlayers,
							nbBots,
						})),
					});
				}

				// Backstop for any finisher whose per-finish write was lost (swallowed DB error).
				const finishers = sorted
					.map((p, i) => ({ p, position: i + 1 }))
					.filter(({ p }) => p.kind === 'user' && p.userId != null && !p.left);
				if (finishers.length > 0) {
					const saved = await this.prisma.matchResult.findMany({
						where: { matchId: room.matchId },
						select: { userId: true },
					});
					const savedIds = new Set(saved.map((r: { userId: number | null }) => r.userId));
					for (const { p, position } of finishers) {
						if (!savedIds.has(p.userId as number)) {
							await this.completePlayer(room, p, position);
						}
					}
				}
			}
			await this.releaseUsers(room);
		} catch (err) {
			console.error(`[Race][${room.id}] finalize failed`, err);
			await this.releaseUsers(room);
		} finally {
			// Guaranteed: clients always receive standings and the room is always torn down.
			this.server.to(room.id).emit('race_finished', {
				results,
				playerCount: room.playerCount,
			});
			console.log(`[Race][${room.id}] finished / ${room.playerCount} racers`);
			this.cleanRoom(roomId);
		}
	}

	async handleDisconnect(socketId: string): Promise<{ roomId: string } | null> {
		const room = this.roomOf(socketId);
		if (!room) return null;

		const p = this.participantOf(room, socketId);
		if (!p) return null;

		this.socketToRoom.delete(socketId);

		if (room.phase === 'waiting' || room.phase === 'countdown') {
			room.players.delete(p.pid);
			if (this.humanCount(room) === 0) {
				this.cleanRoom(room.id);
				return { roomId: room.id };
			}
			this.repadBots(room);
			this.fillBotsNow(room);
			this.emitLobbyUpdate(room);
			return { roomId: room.id };
		}

		if (room.phase !== 'racing') {
			return { roomId: room.id };
		}

		p.socketId = null;
		p.finished = true;
		p.left = true;
		if (p.userId != null) {
			await this.prisma.user.update({
				where: { id: p.userId },
				data: { status: UserStatus.ONLINE },
			}).catch(() => undefined);
		}

		if (this.connectedHumanCount(room) === 0) {
			// Last human left mid-race. If anyone already crossed the line, finalize so the
			// bots' standings — ranked by progress for those that never finished — are saved
			// alongside the finisher. Otherwise the race was abandoned with no result: cancel it.
			const anyHumanFinished = [...room.players.values()].some(
				(x) => x.kind === 'user' && x.finishedAt != null,
			);
			if (anyHumanFinished) {
				await this.finalizeRace(room.id);
			} else if (!this.finalizing.has(room.id)) {
				this.finalizing.add(room.id);
				if (room.botTicker) {
					clearInterval(room.botTicker);
					room.botTicker = null;
				}
				await this.prisma.match.update({
					where: { id: room.matchId },
					data: { status: MatchStatus.CANCELLED },
				}).catch(() => undefined);
				await this.releaseUsers(room);
				this.cleanRoom(room.id);
			}
			return { roomId: room.id };
		}

		if (this.allFinished(room)) await this.finalizeRace(room.id);
		return { roomId: room.id };
	}

	private userIdsOf(room: RoomState): number[] {
		const ids: number[] = [];
		for (const p of room.players.values())
			if (p.kind === 'user' && p.userId != null) ids.push(p.userId);
		return ids;
	}

	private async releaseUsers(room: RoomState): Promise<void> {
		const ids = this.userIdsOf(room);
		if (ids.length === 0) return;
		await this.prisma.user.updateMany({
			where: { id: { in: ids } },
			data: { status: UserStatus.ONLINE },
		}).catch(() => undefined);
	}

	private calcWpm(chars: number, startedAt: number): number {
		const minutes = (Date.now() - startedAt) / 60000;
		return minutes > 0 ? Math.round(chars / 5 / minutes) : 0;
	}

	private cleanRoom(roomId: string): void {
		const room = this.rooms.get(roomId);
		if (!room) return;
		if (room.waitTimer) clearTimeout(room.waitTimer);
		if (room.botFillTimer) clearInterval(room.botFillTimer);
		if (room.countdownTimer) clearTimeout(room.countdownTimer);
		if (room.raceTimeout) clearTimeout(room.raceTimeout);
		if (room.botTicker) clearInterval(room.botTicker);
		for (const p of room.players.values())
			if (p.socketId) this.socketToRoom.delete(p.socketId);
		this.rooms.delete(roomId);
		this.finalizing.delete(roomId);
		console.log(`[Room][${roomId}] deleted`);
	}

	private emitLobbyUpdate(room: RoomState): void {
		const players: LobbyParticipant[] = [...room.players.values()].map((p) => ({
			pid: p.pid,
			kind: p.kind,
			username: p.username,
			avatarUrl: p.avatarUrl,
		}));
		const phase = room.phase === 'countdown' ? 'countdown' : 'waiting';
		for (const p of room.players.values()) {
			if (!p.socketId) continue;
			this.server.sockets.get(p.socketId)?.emit('lobby_update', {
				lobbyId: room.id,
				phase,
				players,
				you: p.pid,
				hostPid: room.hostPid,
				text: room.text,
				countdownEndsAt: room.countdownEndsAt,
			});
		}
	}
}
