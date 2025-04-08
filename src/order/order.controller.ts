// src/order/order.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { UpdateOrderStatusDto } from './dto/updateOrderStatus.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequestWithUser } from 'src/common/types/requestWithUser';

@Controller('orders')
@ApiTags('Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles('customer')
  @ApiOperation({ summary: 'Create a new order' })
  async create(
    // @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateOrderDto,
    @Req() req: RequestWithUser,
  ) {
    return this.orderService.createOrder(dto, req.user);
  }

  @Get()
  @Roles('customer')
  @ApiOperation({ summary: 'Get all orders for the logged-in customer' })
  async getMyOrders(@Req() req: RequestWithUser) {
    return this.orderService.getCustomerOrders(req.user.id);
  }

  @Get('/available')
  @Roles('rider')
  @ApiOperation({ summary: 'Get all available orders for delivery' })
  async getAvailableOrders() {
    return this.orderService.getAvailableOrders();
  }

  @Post(':id/accept')
  @Roles('rider')
  @ApiOperation({ summary: 'Accept an order as a delivery rider' })
  async acceptOrder(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.orderService.acceptOrder(id, req.user);
  }

  @Post(':id/status')
  @Roles('rider')
  @ApiOperation({ summary: 'Update order status (picked_up, delivered)' })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: RequestWithUser,
  ) {
    if (!dto || !dto.status) {
      throw new BadRequestException('Missing status in request body');
    }
    return this.orderService.updateStatus(id, req.user, dto.status);
  }
}
