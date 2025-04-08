// src/order/order.entity.ts
import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne,
    ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn,
    DeleteDateColumn
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { Menu } from 'src/menu/menu.entity';

export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    PICKED_UP = 'picked_up',
    DELIVERED = 'delivered',
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User) 
    customer: User;

    @ManyToOne(() => Restaurant)
    restaurant: Restaurant;

    @ManyToMany(() => Menu)
    @JoinTable()
    items: Menu[];

    @ManyToOne(() => User, { nullable: true }) 
    deliveryRider: User;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    deliveredAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
