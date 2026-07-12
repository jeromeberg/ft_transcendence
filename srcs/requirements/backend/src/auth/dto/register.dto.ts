import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @IsString()
    @Matches(/^[^@]+$/, { message: 'USERNAME_CANNOT_CONTAIN_AT' })
    @ApiProperty({ example: 'johndoe' })
    username: string;

    @IsEmail()
    @ApiProperty({ example: 'john@example.com' })
    email: string;

    @IsString()
    @MinLength(8)
    @ApiProperty({ example: 'Password123!' })
    password: string;
}
