import {
    Controller,
    Post,
    Get,
    Query,
    Body,
    UseGuards,
    HttpCode,
    Redirect,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

//API LIMIT
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_LIMIT_AUTH, THROTTLE_LIMIT_AUTH_GLOBAL } from '../common/throttle.constants';

//AUTH
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { SafeUser } from '../common/types';

//DTO STRICT
import { RegisterDto, LoginDto } from './dto';
import { LoginResponseDto, LogoutResponseDto } from '../common/dto/auth-response.dto';
import { UserProfileDto } from '../common/dto/users-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User created', type: UserProfileDto })
    @ApiResponse({ status: 409, description: 'USER_ALREADY_EXISTS' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH })
    @Post('register')
    register(@Body() body: RegisterDto) {
        return this.authService.register(body.username, body.email, body.password);
    }

    @ApiOperation({ summary: 'Login' })
    @ApiResponse({ status: 200, type: LoginResponseDto })
    @ApiResponse({ status: 401, description: 'INVALID_CREDENTIALS' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH })
    @Post('login')
    @HttpCode(200)
    login(@Body() body: LoginDto) {
        return this.authService.login(body.identifier, body.password);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user' })
    @ApiResponse({ status: 200, type: UserProfileDto })
    @Throttle({ default: THROTTLE_LIMIT_AUTH_GLOBAL })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: SafeUser) {
        return user;
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout' })
    @ApiResponse({ status: 200, type: LogoutResponseDto })
    @Throttle({ default: THROTTLE_LIMIT_AUTH })
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(200)
    logout(@CurrentUser() user: SafeUser) {
        return this.authService.logout(user.id);
    }

    @ApiOperation({ summary: 'Redirect to 42 OAuth login page' })
    @ApiResponse({ status: 302, description: 'Redirects to api.intra.42.fr/oauth/authorize' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH })
    @Get('42')
    @Redirect()
    redirectTo42() {
        const params = new URLSearchParams({
            client_id: process.env.FORTYTWO_CLIENT_ID as string,
            redirect_uri: process.env.FORTYTWO_CALLBACK_URL as string,
            response_type: 'code',
            scope: 'public',
        });
        return { url: `https://api.intra.42.fr/oauth/authorize?${params}`, statusCode: 302 };
    }

    @ApiOperation({
        summary: '42 OAuth callback — exchanges code for JWT and redirects to frontend',
    })
    @ApiResponse({ status: 302, description: 'Redirects to FRONTEND_URL/auth/callback?token=...' })
    @Throttle({ default: THROTTLE_LIMIT_AUTH })
    @Get('42/callback')
    @Redirect()
    async callback42(@Query('code') code: string, @Query('error') error: string) {
        if (error || !code)
            return {
                url: `${process.env.FRONTEND_URL}/signin?error=oauth_denied`,
                statusCode: 302,
            };
        const { access_token } = await this.authService.loginWith42(code);
        return {
            url: `${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`,
            statusCode: 302,
        };
    }
}
