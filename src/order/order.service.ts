// src/order/order.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { User } from 'src/user/user.entity';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { Menu } from 'src/menu/menu.entity';
import { CreateOrderDto } from './dto/createOrder.dto';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(Restaurant)
    private restaurantRepo: Repository<Restaurant>,

    @InjectRepository(Menu)
    private menuRepo: Repository<Menu>,

    private gateway: OrderGateway,
  ) { }

  async createOrder(dto: CreateOrderDto, customer: User) {
    const { items } = dto;

    if (!items || items.length === 0) {
      throw new BadRequestException('At least one menu item is required');
    }

    const menuIds = items.map((item) => item.menuId);

    const firstMenu = await this.menuRepo.findOne({
      where: { id: menuIds[0] },
      relations: ['restaurant'],
    });

    if (!firstMenu) {
      throw new NotFoundException('Menu item not found');
    }

    const restaurant = firstMenu.restaurant;

    const menuItems = await this.menuRepo.find({
      where: { id: In(menuIds) },
      relations: ['restaurant'],
    });

    const invalidItem = menuItems.find(
      (item) => item.restaurant.id !== restaurant.id,
    );
    if (invalidItem) {
      throw new BadRequestException(
        'All items must belong to the same restaurant',
      );
    }

    // Optional: attach quantities to menu items (useful later)
    const quantityMap = new Map<number, number>();
    items.forEach(({ menuId, quantity }) => quantityMap.set(menuId, quantity));

    menuItems.forEach((item) => {
      (item as any).quantity = quantityMap.get(item.id);
    });

    const order = this.orderRepo.create({
      customer,
      restaurant,
      items: menuItems,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepo.save(order);

    // Optional: reload with relations for return payload consistency
    return this.orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: ['customer', 'restaurant', 'items'],
    });
  }



  async getCustomerOrders(customerId: number) {
    return this.orderRepo.find({
      where: { customer: { id: customerId } },
      relations: ['restaurant', 'items', 'deliveryRider'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAvailableOrders() {
    return this.orderRepo.find({
      where: {
        status: OrderStatus.PENDING,
        deliveryRider: IsNull(),
      },
      relations: ['restaurant', 'items', 'customer'],
    });
  }

  async acceptOrder(orderId: number, rider: User) {
    const activeOrder = await this.orderRepo.findOne({
      where: {
        deliveryRider: { id: rider.id },
        status: In([OrderStatus.ACCEPTED, OrderStatus.PICKED_UP]),
      },
    });

    if (activeOrder) {
      throw new BadRequestException('You already have an active order');
    }

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['deliveryRider'],
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.deliveryRider) {
      throw new ForbiddenException('Order already assigned to another rider');
    }

    order.deliveryRider = rider;
    order.status = OrderStatus.ACCEPTED;
    return this.orderRepo.save(order);
  }

  async updateStatus(orderId: number, rider: User, newStatus: OrderStatus) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['deliveryRider','customer'],
    });
  
    if (!order) {
      throw new NotFoundException('Order not found');
    }
  
    // Optional: make sure only the assigned rider can update
    if (order.deliveryRider?.id !== rider.id) {
      throw new ForbiddenException('You are not assigned to this order');
    }
  
    // Define valid transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.ACCEPTED],
      [OrderStatus.ACCEPTED]: [OrderStatus.PICKED_UP],
      [OrderStatus.PICKED_UP]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
    };
  
    const allowedNextStatuses = validTransitions[order.status];
  
    if (!allowedNextStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${newStatus}`,
      );
    }
  
    order.status = newStatus;
  
    if (newStatus === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }
  
    this.orderRepo.save(order);

    this.gateway.sendOrderUpdate(order.customer.id, {
      orderId: order.id,
      status: order.status,
      timestamp: new Date(),
    });
  }
  
}
