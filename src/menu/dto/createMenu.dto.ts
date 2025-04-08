import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Margherita Pizza' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'Classic cheese pizza with tomato base' })
  @IsString()
  @IsOptional()
  description?: string;
}
