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
  Request,
  Req,
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

  @Put('refresh-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateUser() {
    return await this.userService.refreshUsers();
  }

  @Get('profile/:name')
  async getProfile(@Param('name') name: string) {
    return await this.userService.getProfile(name);
  }

  @Get('profile-for-edit/:name')
  @UseGuards(JwtAuthGuard)
  async getProfileForEdit(@Param('name') name: string, @Request() req) {
    return await this.userService.getProfileForEdit(name, req.user);
  }

  @Put('update-profile')
  @UseGuards(JwtAuthGuard)
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
    @Request() req,
    @Body() body: UpdateUserDto,
    @UploadedFiles()
    files?: {
      photo_profile?: Express.Multer.File;
    },
  ) {
    return await this.userService.updateProfile(
      req.user.userId,
      body,
      files.photo_profile?.[0],
    );
  }

  @Put('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(@Request() req, @Body('password') password: string) {
    return await this.userService.updatePassword(req.user.userId, password);
  }

  @Get('check-premium')
  @UseGuards(JwtAuthGuard)
  async getCheckPremium(@Request() req) {
    return await this.userService.getCheckPremium(req.user.userId);
  }
}
