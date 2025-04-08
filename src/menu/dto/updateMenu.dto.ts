import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMenuDto {
  @ApiPropertyOptional({ example: 'Updated Margherita Pizza' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 12.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'Now with extra cheese' })
  @IsString()
  @IsOptional()
  description?: string;
}
