import {
  Controller,
  Get,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PhotoAnimeService } from './photo_anime.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';

@Controller('photo-anime')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PhotoAnimeController {
  constructor(private readonly photoAnimeService: PhotoAnimeService) {}

  @Delete('delete/:id')
  async deletePhoto(@Param('id') id: string) {
    return this.photoAnimeService.deletePhoto(id);
  }

  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 1 }, // photo_cover untuk foto cover anime pada kolom photo_cover
      ],
      {
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
          destination: './images/anime/content',
          filename: (req, file, cb) => {
            cb(null, `${v4()}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async updatePhoto(
    @Param('id') id: string,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ) {
    // Check if file is defined
    if (!files) {
      throw new Error('File gagal diupload');
    }
    return this.photoAnimeService.updatePhoto(id, files?.photos?.[0]);
  }

  @Get('get-all')
  async getAllPhoto(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return this.photoAnimeService.getAllPhoto(page, limit, search);
  }

  @Get('get/:id')
  async getPhotoById(@Param('id') id: string) {
    return this.photoAnimeService.getPhotoById(id);
  }
}
