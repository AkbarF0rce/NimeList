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
import { JwtAuthGuard } from '../../AuthModule/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../AuthModule/common/guards/roles.guard';
import { Roles } from '../../AuthModule/common/decorators/roles.decorator';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateUser() {
    return await this.userService.refreshUsers();
  }

  @Get('detail-admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getOneUser(@Param('id') id: string) {
    return await this.userService.getDetailAdmin(id);
  }
}
