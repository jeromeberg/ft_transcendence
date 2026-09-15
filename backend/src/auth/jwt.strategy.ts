import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET as string,
        });
    }

    async validate(payload: { sub: number; iat: number }) {
        const user = await this.authService.validateUser(payload.sub);
        if (!user) throw new UnauthorizedException('USER_NOT_FOUND');
        if (payload.iat * 1000 < user.createdAt.getTime() - 1000)
            throw new UnauthorizedException('TOKEN_STALE');
        return user;
    }
}
