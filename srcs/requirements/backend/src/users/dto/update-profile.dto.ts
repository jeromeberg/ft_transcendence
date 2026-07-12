import { IsOptional, MaxLength, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'Hello world' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    bio?: string;
}
