import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto } from './dto/createRestaurant.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepo: Repository<Restaurant>,
  ) { }

  async findAll() {
    const restaurants = await this.restaurantRepo.find({
      where: { deletedAt: IsNull() },
      relations: ['owner'],
    });
    restaurants.map(restaurant=>{
      if( restaurant && restaurant.owner ) delete (restaurant.owner as any).password;
    })
    return restaurants
  }

  async myRestaurants(ownerId: number){
    const id = Number(ownerId);
    return this.restaurantRepo.find({
      where: {
        owner: {id},
        deletedAt: IsNull()
      }
    });
  }

  async create(dto: CreateRestaurantDto, ownerId: number) {
    const restaurant = this.restaurantRepo.create({
      ...dto,
      owner: { id: ownerId } as User,
    });
    return this.restaurantRepo.save(restaurant);
  }

  async update(id: number, dto: CreateRestaurantDto, ownerId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      relations: ['owner'],
      withDeleted: true,
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.owner.id !== ownerId || restaurant.deletedAt) {
      throw new ForbiddenException('You are not authorized to update this restaurant');
    }

    if(restaurant && restaurant.owner ) delete (restaurant.owner as any).password;

    Object.assign(restaurant, dto);
    return this.restaurantRepo.save(restaurant);
  }

  async delete(id: number, ownerId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['owner']
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.owner.id !== ownerId) {
      throw new ForbiddenException('You are not authorized to delete this restaurant');
    }
    if(restaurant && restaurant.owner ) delete (restaurant.owner as any).password;

    return this.restaurantRepo.softRemove(restaurant);
  }

  async getById(id: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['owner'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if(restaurant && restaurant.owner ) delete (restaurant.owner as any).password;

    return restaurant;
  }


}
