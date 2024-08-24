import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Patch,
  Param,
  UploadedFile,
  Delete,
  NotFoundException,
  Put,
  Get,
} from '@nestjs/common';
import { AnimeService } from './anime.service';
import { CreateAnimeDto } from './dto/create-anime.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { get } from 'http';

@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Post('postAnime')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 4 }, // You can limit the number of photos
        { name: 'photo_cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            // Tentukan destinasi berdasarkan field name
            let uploadPath = '';

            // Jika field name adalah 'photo_cover', lakukan ini
            if (file.fieldname === 'photo_cover') {
              uploadPath = join('src/anime/covers');
            }
            // Jika field name adalah 'photos', lakukan ini
            else if (file.fieldname === 'photos') {
              uploadPath = join('src/photo_anime/photos');
            }

            cb(null, uploadPath);
          },
          filename: (req, file, cb) => {
            cb(null, `${file.originalname}`);
          },
        }),
      },
    ),
  )
  async create(
    @Body() createAnimeDto: CreateAnimeDto,
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
      photo_cover?: Express.Multer.File[];
    },
  ) {
    return this.animeService.create(
      createAnimeDto,
      files.photos || [],
      files.photo_cover?.[0],
    );
  }

  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 4 }, // photos for photo anime
        { name: 'photo_cover', maxCount: 1 }, // photo_cover for anime cover
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            // Tentukan destinasi berdasarkan field name
            let uploadPath = '';

            // Jika field name adalah 'photo_cover', lakukan ini
            if (file.fieldname === 'photo_cover') {
              uploadPath = join('src/anime/covers');
            }
            // Jika field name adalah 'photos', lakukan ini
            else if (file.fieldname === 'photos') {
              uploadPath = join('src/photo_anime/photos');
            }

            cb(null, uploadPath);
          }, // Adjust the path based on your needs
          filename: (req, file, cb) => {
            cb(null, `${file.originalname}`);
          },
        }),
      },
    ),
  )
  async updateAnimeDetails(
    @Param('id') animeId: number,
    @Body() updateAnimeDto: CreateAnimeDto, // DTO untuk data anime
    @Body('genreIds') genreIds: number[], // Genre IDs yang ingin diupdate
    @UploadedFiles() files: { photos?: Express.Multer.File[]; photo_cover?: Express.Multer.File[] }, // Menangani file foto yang diupload
  ) {
    // Panggil service untuk mengupdate data
    const updatedAnime = await this.animeService.updateAnimeDetails(
      animeId,
      updateAnimeDto,
      genreIds,
      files.photos || [], // Mengirim file foto ke service (jika ada)
      files?.photo_cover?.[0], // Mengirim file photo_cover ke service (jika ada)
    );

    return updatedAnime;
  }

  @Get('get/:id')
  async getAnime(@Param('id') animeId: number) {
    return this.animeService.getAnime(animeId);
  }
}
