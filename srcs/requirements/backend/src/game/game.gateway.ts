import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets'
import { GameService, JoinInput } from './game.service'
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard'
import { AuthService } from '../auth/auth.service'
import { Socket, Namespace } from 'socket.io';
import { MAX_WPM } from '../common/game.constant';
import { WS_CORS } from '../common/ws.config'
import { PlayerProgressDto } from './dto/player-progress.dto'

function sanitizeGuestName(raw: unknown): string {
	if (typeof raw !== 'string') return 'Guest';
	const name = raw.trim().replace(/\s+/g, ' ').slice(0, 20).trim();
	return name.length > 0 ? name : 'Guest';
}

@WebSocketGateway({ cors: WS_CORS, namespace: '/game' })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Namespace;

  constructor(
	  private gameService: GameService,
	  private authService: AuthService,
  ) {}

  afterInit() {
	this.gameService.setServer(this.server);
  }

  async handleConnection(client: Socket) {
    const auth = client.handshake.auth ?? {};
    if (auth.token) {
        const ok = await this.authService.validateWsClient(client);
        if (!ok)
            return client.disconnect();
        return;
    }
    if (auth.guest === true) {
        client.data.guest = { username: sanitizeGuestName(auth.nickname) };
        return;
    }
    return client.disconnect();
  }

  async handleDisconnect(client: Socket) {
	await this.gameService.handleDisconnect(client.id);
  }

  private resolveJoin(client: Socket): JoinInput | null {
	const user = client.data.user;
	if (user)
		return { socketId: client.id, kind: 'user', userId: user.id, username: user.username, avatarUrl: user.avatarUrl ?? null };
	const guest = client.data.guest;
	if (guest)
		return { socketId: client.id, kind: 'guest', userId: null, username: guest.username, avatarUrl: null };
	return null;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_queue')
  async handleJoinQueue(client: Socket) {
	const input = this.resolveJoin(client);
	if (!input)
		return;
	const result = await this.gameService.assign(input);
	if (result.status === 'joined')
		client.join(result.room.id);
	else if (result.status === 'duplicate_session')
		client.emit('join_rejected', { reason: 'duplicate_session' });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_queue')
  async handleLeaveQueue(client: Socket) {
	const left = await this.gameService.handleDisconnect(client.id);
	if (!left)
		return;
	client.leave(left.roomId);
  }

  @UseGuards(WsJwtGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('player_progress')
  async handleProgress(client: Socket, payload: PlayerProgressDto) {
	const delta = this.gameService.updateProgress(client.id, payload.chars, payload.durationMs, payload.accuracy);
	if (!delta)
		return;

	if (delta.wpm > MAX_WPM)
		console.warn(`[CHEAT?][${delta.roomId}] ${delta.username} wpm:${delta.wpm}`);

	this.server.to(delta.roomId).emit('race_update', {
		pid: delta.pid,
		username: delta.username,
		kind: delta.kind,
		progress: delta.progress,
		wpm: delta.wpm,
	});

	if (delta.progress >= 1) {
		const finish = this.gameService.handleFinish(client.id);
		if (finish) {
			client.emit('you_finished', { position: finish.position, playerCount: finish.playerCount });
			const rewards = await this.gameService.recordFinish(client.id, finish.position);
			if (rewards && (rewards.newAchievements.length > 0 || rewards.newLevel !== null)) {
				client.emit('race_rewards', rewards);
			}
			if (finish.allDone) {
				await this.gameService.finalizeRace(finish.roomId);
			}
		}
	}
  }
}
