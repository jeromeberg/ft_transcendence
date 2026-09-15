import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class MarkNotificationsReadDto {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(100)
    @IsInt({ each: true })
    @Type(() => Number)
    ids: number[];
}
