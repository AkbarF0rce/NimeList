import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UploadedFile,
} from '@nestjs/common';
import { PhotoProfileService } from './photo_profile.service';
import { CreatePhotoProfileDto } from './dto/create-photo_profile.dto';
import { UpdatePhotoProfileDto } from './dto/update-photo_profile.dto';
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 } from 'uuid';

@Controller('photo-profile')
export class PhotoProfileController {
  constructor(private readonly photoProfileService: PhotoProfileService) {}

  @Post('create-photo-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'photo', maxCount: 1 }], {
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
  create(
    @Body('id_user') id_user: string,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.photoProfileService.create(id_user, photo);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPhotoAdmin(@Body('id') id: string) {
    return this.photoProfileService.getPhotoAdmin(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.photoProfileService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePhotoProfileDto: UpdatePhotoProfileDto,
  ) {
    return this.photoProfileService.update(+id, updatePhotoProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.photoProfileService.remove(+id);
  }
}
