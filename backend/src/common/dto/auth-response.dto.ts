import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
    access_token: string;
}

export class LogoutResponseDto {
    @ApiProperty({ example: 'LOGOUT_SUCCESS' })
    message: string;
}
