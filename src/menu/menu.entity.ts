import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    DeleteDateColumn,
} from 'typeorm';
import { Restaurant } from 'src/restaurant/restaurant.entity';

@Entity()
export class Menu {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, {
        onDelete: 'CASCADE',
    })
    restaurant: Restaurant;

    @DeleteDateColumn()
    deletedAt: Date;
}
