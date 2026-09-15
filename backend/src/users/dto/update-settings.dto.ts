import { IsOptional, MinLength, IsString, IsEmail } from 'class-validator';
import { Language } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
    @ApiPropertyOptional({ example: 'new@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: 'OldPassword123!' })
    @IsOptional()
    @IsString()
    currentPassword?: string;

    @ApiPropertyOptional({ example: 'NewPassword123!' })
    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;

    @ApiPropertyOptional({ enum: Language, example: 'EN' })
    @IsOptional()
    @IsEnum(Language)
    language?: Language;
}
