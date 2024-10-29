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
  HttpStatus,
  HttpException,
  Query,
} from '@nestjs/common';
import { AnimeService } from './anime.service';
import { CreateAnimeDto } from './dto/create-anime.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname, join } from 'path';
import * as fs from 'fs';
import { v4 } from 'uuid';
import { UpdateAnimeDto } from './dto/update-anime.dto';

@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Post('post')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos_anime', maxCount: 4 }, // You can limit the number of photos
        { name: 'photo_cover', maxCount: 1 },
      ],
      {
        fileFilter: (req, file, cb) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(
              new Error('Hanya file gambar yang diperbolehkan!'),
              false,
            );
          }
          cb(null, true);
        },
        storage: diskStorage({
          destination: (req, file, cb) => {
            // Menentukan folder penyimpanan berdasarkan fieldname (photo_cover atau photo_content)
            if (file.fieldname === 'photo_cover') {
              cb(null, './images/anime/cover');
            } else if (file.fieldname === 'photos_anime') {
              cb(null, './images/anime/content');
            }
          },
          filename: (req, file, cb) => {
            // Generate UUID untuk nama file
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
      photos_anime?: Express.Multer.File[];
      photo_cover?: Express.Multer.File[];
    },
  ) {
    return this.animeService.createAnime(
      createAnimeDto,
      files.photos_anime || [],
      files.photo_cover?.[0],
    );
  }

  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos_anime', maxCount: 4 }, // photos untuk foto anime pada table photo_anime
        { name: 'photo_cover', maxCount: 1 }, // photo_cover untuk foto cover anime pada kolom photo_cover
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
          destination: (req, file, cb) => {
            // Menentukan folder penyimpanan berdasarkan fieldname (photo_cover atau photo_content)
            if (file.fieldname === 'photo_cover') {
              cb(null, './images/anime/cover');
            } else if (file.fieldname === 'photos_anime') {
              cb(null, './images/anime/content');
            }
          },
          filename: (req, file, cb) => {
            // Generate UUID untuk nama file
            cb(null, `${v4()}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async updateAnimeDetails(
    @Param('id') animeId: string,
    @Body() updateAnimeDto: UpdateAnimeDto, // DTO untuk data anime
    @Body('genres') genres: [],
    @Body('existing_photos') existingPhotosString: string[],
    @UploadedFiles()
    files: {
      photos_anime?: Express.Multer.File[];
      photo_cover?: Express.Multer.File[];
    },
  ) {
    const updatedAnime = await this.animeService.updateAnime(
      animeId,
      updateAnimeDto,
      genres,
      files.photos_anime || [],
      files?.photo_cover?.[0],
      existingPhotosString,
    );

    return updatedAnime;
  }

  @Get('get-admin')
  async getAllAnimeAdmin(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.animeService.getAllAnimeAdmin(page, limit, search);
  }

  @Get('get-newest')
  async getAnimeNewest(
    @Query('limit') limit: number,
  ) {
    return await this.animeService.getAnimeNewest(limit);
  }

  @Get('get/:id')
  async getAnime(@Param('id') animeId: string) {
    return await this.animeService.getAnimeById(animeId);
  }

  @Get('get/by-genre/:id')
  async getAnimeByGenre(@Param('id') genreId: number) {
    return await this.animeService.getAnimeByGenre(genreId);
  }

  @Delete('delete/:id')
  async deleteAnime(@Param('id') animeId: string) {
    return await this.animeService.deleteAnime(animeId);
  }

  @Get('recommended')
  async getRecommendedAnime() {
    return await this.animeService.getRecommended();
  }

  @Get('get-all-genre')
  async getAllGenre() {
    return await this.animeService.getAllGenre();
  }

  @Get('get-most-popular')
  async getMostPopular() {
    return await this.animeService.getMostPopular();
  }
}
