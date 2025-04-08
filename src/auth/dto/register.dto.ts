import { IsEmail, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'janedoe@example.com',
    description: 'Email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'strongPassword456',
    description: 'Password for the user account',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'customer',
    description: 'Role of the user',
    enum: ['customer', 'owner', 'rider'],
  })
  @IsIn(['customer', 'owner', 'rider'])
  role: 'customer' | 'owner' | 'rider';
}
