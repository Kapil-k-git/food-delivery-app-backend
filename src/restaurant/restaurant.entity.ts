import { Menu } from 'src/menu/menu.entity';
import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn, OneToMany } from 'typeorm';

@Entity()
export class Restaurant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column({ nullable: true })
    cuisine?: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Menu, (menu) => menu.restaurant)
    menuItems: Menu[];

    @ManyToOne(() => User, (user) => user.restaurants)
    owner: User;
}
