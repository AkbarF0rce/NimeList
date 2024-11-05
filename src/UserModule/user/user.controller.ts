import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../AuthModule/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../AuthModule/common/guards/roles.guard';
import { Roles } from '../../AuthModule/common/decorators/roles.decorator';
import { status_premium } from './entities/user.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';
import { extname } from 'path';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Put('update-profile-admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'photo_profile', maxCount: 1 }], {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(
            new HttpException(
              'Hanya file gambar yang diperbolehkan!',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './images/photo-profile');
        },
        filename: (req, file, cb) => {
          // Generate UUID untuk nama file
          cb(null, `${v4()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updateProfileAdmin(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @UploadedFiles()
    files?: {
      photo_profile?: Express.Multer.File;
    },
  ) {
    return await this.userService.updateProfileAdmin(
      id,
      body,
      files.photo_profile?.[0],
    );
  }
}
