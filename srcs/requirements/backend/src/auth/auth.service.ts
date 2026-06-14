import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus, Role } from '@prisma/client'
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Socket } from 'socket.io';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async register(username: string, email: string, password: string) {
    return this.usersService.create(username, email, password);
  }

  async login(identifier: string, password: string) {
    const user = identifier.includes('@')
      ? await this.usersService.findByEmailForLogin(identifier)
      : await this.usersService.findByUsernameForLogin(identifier);
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('INVALID_CREDENTIALS');

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch)
      throw new UnauthorizedException('INVALID_CREDENTIALS');

    const payload = { sub: user.id };

    // await this.prisma.user.update({
    //     where: { id: user.id },
    //     data: { status: UserStatus.ONLINE }
    // });

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(userId: number) {
    return this.usersService.findById(userId);
  }

  async validateWsClient(client: Socket): Promise<boolean>{
    const token = client.handshake.auth?.token;
    if (!token) {
      client.disconnect();
      return false;
    }
    try {
      const payload = this.jwtService.verify<{ sub: number}>(token);
      const user = await this.validateUser(payload.sub);
      if (!user) {
        client.disconnect();
        return false;
      }
      client.data.user = user;
      return true;
    } catch {
      client.disconnect();
      return false;
    }
  }

    async logout(userId: number) {
    await this.prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.OFFLINE }
    });
    return { message: 'LOGOUT_SUCCESS' };
  }

  async loginWith42(code: string){

    const tokenRes = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grant_type:    'authorization_code',
            client_id:     process.env.FORTYTWO_CLIENT_ID,
            client_secret: process.env.FORTYTWO_CLIENT_SECRET,
            code,
            redirect_uri:  process.env.FORTYTWO_CALLBACK_URL,
        }),
    });

    if (!tokenRes.ok) {
      if (tokenRes.status === 400)
        throw new BadRequestException('FORTYTWO_BAD_REQUEST');
      if (tokenRes.status === 401)
        throw new UnauthorizedException('FORTYTWO_UNAUTHORIZED');
      if (tokenRes.status === 403)
        throw new UnauthorizedException('FORTYTWO_FORBIDDEN');
      if (tokenRes.status === 404)
        throw new UnauthorizedException('FORTYTWO_NOT_FOUND');

      throw new UnauthorizedException('FORTYTWO_TOKEN_EXCHANGE_FAILED');
    }

    const { access_token } = await tokenRes.json();

    if (!access_token) {
        throw new UnauthorizedException('FORTYTWO_INVALID_TOKEN');
    }

    const meRes = await fetch('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!meRes.ok) {
      if (meRes.status === 401)
        throw new UnauthorizedException('FORTYTWO_TOKEN_EXPIRED');
      if (meRes.status === 403)
        throw new UnauthorizedException('FORTYTWO_FORBIDDEN');
      if (meRes.status === 404)
        throw new UnauthorizedException('FORTYTWO_USER_NOT_FOUND');

      throw new UnauthorizedException('FORTYTWO_USER_FETCH_FAILED');
    }

    const me = await meRes.json();

    if (!me?.id || !me?.login || !me.email)
      throw new UnauthorizedException('FORTYTWO_INVALID_USER_DATA');

    let oauthAccount = await this.prisma.oAuthAccount.findUnique({
        where: { provider_providerId: { provider: 'QuaranteDeux', providerId: String(me.id) } },
        include: { user: true },
    });

    let user;

    if (oauthAccount) {
        user = oauthAccount.user;
    } else {
      let username = me.login;
      const existing = await this.usersService.findByUsername(username);

      if (existing)
        username = `${me.login}_42`;

      const existingEmail = await this.usersService.findByEmail(me.email);

      if (existingEmail)
        throw new BadRequestException('EMAIL_ALREADY_IN_USE');
      
      user = await this.prisma.$transaction(async (tx) => {
        const usersCount = await tx.user.count();
        return tx.user.create({
          data: {
            username,
            email: me.email,
            avatarUrl: me.image?.versions?.small ?? null,
            role: usersCount === 0 ? Role.MOD : Role.USER,
            oauthAccounts: {
              create: { provider: 'QuaranteDeux', providerId: String(me.id) },
            },
          },
        });
      });
    }

    return {
      access_token: this.jwtService.sign({ sub: user.id }),
    };
  }
}
