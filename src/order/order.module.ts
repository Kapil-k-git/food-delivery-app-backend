import { Module, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderGateway } from './order.gateway';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { Menu } from 'src/menu/menu.entity';
import { RestaurantModule } from 'src/restaurant/restaurant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order,Menu, Restaurant])],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway],
})
export class OrderModule {}
