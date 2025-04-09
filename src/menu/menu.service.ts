import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { CreateMenuDto } from './dto/createMenu.dto';
import { UpdateMenuDto } from './dto/updateMenu.dto';
import { Menu } from './menu.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,

    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) { }

  async create(restaurantId: number, dto: CreateMenuDto, ownerId: number) {

    const restaurant = await this.restaurantRepo.findOne({
      where: { id: restaurantId },
      relations: ['owner'],
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.owner.id !== ownerId) throw new UnauthorizedException();

    if (restaurant && restaurant.owner) {
      delete (restaurant.owner as any).password;
    }

    const menu = this.menuRepo.create({ ...dto, restaurant });
    return this.menuRepo.save(menu);
  }

  async update(menuId: number, dto: UpdateMenuDto, ownerId: number) {
    const menu = await this.menuRepo.findOne({
      where: { id: menuId },
      relations: ['restaurant', 'restaurant.owner'],
      withDeleted: true,
    });

    if (!menu) throw new NotFoundException('Menu item not found');
    if (menu.restaurant.owner.id !== ownerId) throw new UnauthorizedException();
    if (menu.deletedAt) throw new Error('Menu item is already deleted');

    if (menu && menu.restaurant.owner) {
      delete (menu.restaurant.owner as any).password;
    }

    Object.assign(menu, dto);
    return this.menuRepo.save(menu);
  }

  async delete(menuId: number, ownerId: number) {
    const menu = await this.menuRepo.findOne({
      where: {
        id: menuId,
        deletedAt: IsNull()
      },
      relations: ['restaurant', 'restaurant.owner'],
      withDeleted: true,
    });

    if (!menu) throw new NotFoundException('Menu item not found');
    if (menu.restaurant.owner.id !== ownerId) throw new UnauthorizedException();
    if (menu.deletedAt) throw new Error('Menu item is already deleted');

    if (menu && menu.restaurant && menu.restaurant.owner ) {
      delete (menu.restaurant.owner as any).password;
    }

    const isDeleted = await this.menuRepo.softRemove(menu);
    if (isDeleted) {
      return { "message": "Successfully deleted", menu }
    }
    return
  }

  async getByRestaurant(restaurantId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: restaurantId, deletedAt: IsNull() },
    });
  
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }
  
    const menuItems = await this.menuRepo.find({
      where: {
        restaurant: { id: restaurantId },
        deletedAt: IsNull(),
      },
    });
  
    if (!menuItems.length) {
      throw new NotFoundException(`No menu items found for restaurant ID ${restaurantId}`);
    }
  
    return menuItems;
  }
}
