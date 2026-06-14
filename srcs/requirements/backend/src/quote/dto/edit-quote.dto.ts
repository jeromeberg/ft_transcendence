import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditQuoteDto {
  @ApiProperty({ example: 'I am an updated quote!', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  text?: string;

  @ApiProperty({ example: 'book', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
