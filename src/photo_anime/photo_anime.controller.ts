import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { PhotoAnimeService } from './photo_anime.service';
import { CreatePhotoAnimeDto } from './dto/create-photo_anime.dto';
import { UpdatePhotoAnimeDto } from './dto/update-photo_anime.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';
import { extname } from 'path';

@Controller('photo-anime')
export class PhotoAnimeController {
  constructor(private readonly photoAnimeService: PhotoAnimeService) {}

  @Delete('delete/:id')
  async deletePhoto(@Param('id') id: number) {
    return this.photoAnimeService.deletePhoto(id);
  }

  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 1 }, // Limit file foto yang akan diupload sesuai keinginan
      ],
      {
        storage: diskStorage({
          destination: 'src/photo_anime/photos/', // Sesuaikan destinasi storage sesuai keinginan
          filename: (req, file, cb) => {
            cb(null, `${v4()}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async updatePhoto(
    @Param('id') id: number,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ){
    // Check if file is defined
    if (!files) {
      throw new Error('File gagal diupload');
    }
    return this.photoAnimeService.updatePhoto(id, files.photos || []);
  }
}
