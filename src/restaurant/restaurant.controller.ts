import {
    Body,
    Controller,
    Param,
    Patch,
    Post,
    UseGuards,
    ParseIntPipe,
    Get,
    Delete,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { CreateRestaurantDto } from './dto/createRestaurant.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/user/user.entity';

@Controller('restaurant')
@ApiTags('Restaurants')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) { }

    @Post()
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Create a new restaurant (Owner only)' })
    create(
        @Body() createRestaurantDto: CreateRestaurantDto,
        @GetUser() user: any,
    ) {
        return this.restaurantService.create(createRestaurantDto, user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get a list of all restaurants' })
    findAll() {
        return this.restaurantService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a restaurant by ID' })
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.restaurantService.getById(id);
    }


    @Patch(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Update a restaurant by ID (Owner only)' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateRestaurantDto,
        @GetUser() user: any,
    ) {
        return this.restaurantService.update(id, dto, user.id);
    }

    @Delete(':id')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Delete a restaurant by ID (Owner only)' })
    delete(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: any,
    ) {
        return this.restaurantService.delete(id, user.id);
    }

}
