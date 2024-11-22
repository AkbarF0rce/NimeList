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
  UseGuards,
  Request,
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
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';

@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Post('post')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
      photos_anime: Express.Multer.File[];
      photo_cover: Express.Multer.File;
    },
  ) {
    return this.animeService.createAnime(
      createAnimeDto,
      files.photos_anime || [],
      files.photo_cover[0],
    );
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllAnimeAdmin(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.animeService.getAllAnimeAdmin(page, limit, search);
  }

  @Get('get-newest')
  async getAnimeNewest(@Query('limit') limit: number) {
    return await this.animeService.getAnimeNewest(limit);
  }

  @Get('get/:slug')
  async getAnime(@Param('slug') slug: string) {
    return await this.animeService.getAnimeBySlug(slug);
  }

  @Get('get/by-genre/:name')
  async getAnimeByGenre(@Param('name') name: string) {
    return await this.animeService.getAnimeByGenre(name);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(JwtAuthGuard)
  @Get('favorite-user')
  async getFavoriteAnime(@Request() req) {
    return await this.animeService.getFavoriteAnimeByUserLogin(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-favorite-by-user')
  async addFavoriteAnime(@Request() req, @Body('id_anime') id_anime: string) {
    return await this.animeService.addFavoriteAnimeByUserLogin(
      req.user.userId,
      id_anime,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-favorite-by-user/:id_anime')
  async deleteFavoriteAnime(
    @Request() req,
    @Param('id_anime') id_anime: string,
  ) {
    return await this.animeService.deleteFavoriteAnimeByUserLogin(
      req.user.userId,
      id_anime,
    );
  }
}
