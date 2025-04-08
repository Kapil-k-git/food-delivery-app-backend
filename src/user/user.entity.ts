import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  CUSTOMER = 'customer',
  OWNER = 'owner',
  RIDER = 'rider',
}

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'hashed_password', description: 'Hashed password' })
  @Column()
  password: string;

  @ApiProperty({ enum: Role, example: Role.CUSTOMER })
  @Column({ type: 'enum', enum: Role })
  role: Role;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];
}
