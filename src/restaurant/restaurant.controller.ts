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
    Req,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { CreateRestaurantDto } from './dto/createRestaurant.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/user/user.entity';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { RequestWithUser } from 'src/common/types/requestWithUser';

@Controller('restaurant')
@ApiTags('Restaurants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) { }

    @Post()
    @ApiBearerAuth('access-token')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Create a new restaurant (Owner only)' })
    create(
        @Body() createRestaurantDto: CreateRestaurantDto,
        @GetUser() user: any,
    ) {
        return this.restaurantService.create(createRestaurantDto, user.id);
    }

    @Get()
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get a list of all restaurants' })
    findAll() {
        return this.restaurantService.findAll();
    }

    @Get('my-restaurant')
    @ApiBearerAuth('access-token')
    @Roles(Role.OWNER)
    @ApiOperation({summary: "Get all restaurant of owner"})
    getRestaurantOfOwner(@Req() req: RequestWithUser){
        return this.restaurantService.myRestaurants(req.user.id)
    }

    @Get(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get a restaurant by ID' })
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.restaurantService.getById(id);
    }


    @Patch(':id')
    @ApiBearerAuth('access-token')
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
    @ApiBearerAuth('access-token')
    @Roles(Role.OWNER)
    @ApiOperation({ summary: 'Delete a restaurant by ID (Owner only)' })
    delete(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: any,
    ) {
        return this.restaurantService.delete(id, user.id);
    }

}
