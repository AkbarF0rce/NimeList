import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('post')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  getAdminData() {
    return 'Admin Access Only';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get('user')
  getUserData() {
    return 'User Access Only';
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  getAllUsersData() {
    return 'Public Access';
  }

  @Get('get-all')
  async getAllUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    return await this.userService.getUsers(page, limit, search, order);
  }

  @Get('get-user-for-pay')
  async getUserPay() {
    return await this.userService.getUserPay();
  }

  @Put('refresh-users')
  async updateUser() {
    return await this.userService.refreshUsers();
  }
}
