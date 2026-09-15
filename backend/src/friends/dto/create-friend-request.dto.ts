import { MaxLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFriendRequestDto {
    @IsString()
    @MaxLength(30)
    @ApiProperty({ example: 'johndoe' })
    username: string;
}
