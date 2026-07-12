import { MaxLength, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty({ example: 'johndoe', description: 'Username du destinataire' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    to: string;

    @ApiProperty({ example: 'Hello!' })
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    content: string;
}
