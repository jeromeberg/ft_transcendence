import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PlayerProgressDto {
    @IsInt()
    @Min(0)
    @Max(100_000)
    chars: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(3_600_000)
    durationMs?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    accuracy?: number;
}
