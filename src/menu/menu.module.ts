import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Restaurant])],
  providers: [MenuService],
  controllers: [MenuController],
})
export class MenuModule {}
