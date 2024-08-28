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
import { v4 } from 'uuid';

@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Post('post')
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
            cb(null, `${v4()}${extname(file.originalname)}`);
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
    return this.animeService.createAnime(
      createAnimeDto,
      files.photos || [],
      files.photo_cover?.[0],
    );
  }

  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 4 }, // photos untuk foto anime pada table photo_anime
        { name: 'photo_cover', maxCount: 1 }, // photo_cover untuk foto cover anime pada kolom photo_cover
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
            cb(null, `${v4()}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async updateAnimeDetails(
    @Param('id') animeId: number,
    @Body() updateAnimeDto: CreateAnimeDto, // DTO untuk data anime
    @Body('genreIds') genreIds: number[], // Genre IDs yang ingin diupdate
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
      photo_cover?: Express.Multer.File[];
    },
  ) {
    const updatedAnime = await this.animeService.updateAnime(
      animeId,
      updateAnimeDto,
      genreIds,
      files.photos || [], // Mengirim file foto ke service (jika ada)
      files?.photo_cover?.[0], // Mengirim file photo_cover ke service (jika ada)
    );

    return updatedAnime;
  }

  @Get('get')
  async getAllAnime() {
    return await this.animeService.getAllAnime();
  }

  @Get('get/:id')
  async getAnime(@Param('id') animeId: number) {
    return await this.animeService.getAnimeById(animeId);
  }

  @Get('get/by-genre/:id')
  async getAnimeByGenre(@Param('id') genreId: number) {
    return await this.animeService.getAnimeByGenre(genreId);
  }

  @Delete('delete/:id')
  async deleteAnime(@Param('id') animeId: number) {
    return await this.animeService.deleteAnime(animeId);
  }
}
