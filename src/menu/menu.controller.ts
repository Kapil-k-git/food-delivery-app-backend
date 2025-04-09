import {
  Controller,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  Get,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateMenuDto } from './dto/createMenu.dto';
import { UpdateMenuDto } from './dto/updateMenu.dto';
import { Role } from 'src/user/user.entity';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Menu')
@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post(':restaurantId')
  @ApiBearerAuth('access-token')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Add menu item to restaurant (OWNER only)' })
  create(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateMenuDto,
    @Req() req: any,
  ) {
    return this.menuService.create(restaurantId, dto, req.user.id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Update menu item (OWNER only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
    @Req() req: any,
  ) {
    return this.menuService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Delete menu item (OWNER only)' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.menuService.delete(id, req.user.id);
  }

  @Get('/item/:restaurantId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all menu items for a restaurant' })
  getByRestaurant(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.menuService.getByRestaurant(restaurantId);
  }
}
