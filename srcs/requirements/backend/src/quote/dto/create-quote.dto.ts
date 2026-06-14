import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty({ example: 'I am a quote from a book!' })
  @IsString()
  @MinLength(10)
  text: string;

  @ApiProperty({ example: 'book', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}
