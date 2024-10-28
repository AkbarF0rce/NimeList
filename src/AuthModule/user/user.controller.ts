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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { status_premium } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Get('get-admin')
  async getAllUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('status') status?: status_premium,
  ) {
    return await this.userService.getUsers(page, limit, search, status);
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
