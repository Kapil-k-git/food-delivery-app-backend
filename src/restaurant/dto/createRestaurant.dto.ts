import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantDto {
    @ApiProperty({ example: 'Sushi World', description: 'Name of the restaurant' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '123 Main St, Tokyo', description: 'Address of the restaurant' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: 'Japanese', description: 'Type of cuisine offered' })
    @IsString()
    @IsNotEmpty()
    cuisine: string;
}
