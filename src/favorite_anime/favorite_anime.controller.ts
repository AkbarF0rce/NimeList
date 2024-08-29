import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { FavoriteAnimeService } from './favorite_anime.service';
import { CreateFavoriteAnimeDto } from './dto/create-favorite_anime.dto';
import { UpdateFavoriteAnimeDto } from './dto/update-favorite_anime.dto';

@Controller('favorite-anime')
export class FavoriteAnimeController {
  constructor(private readonly favoriteAnimeService: FavoriteAnimeService) {}

  @Post('post')
  async create(@Body() data: CreateFavoriteAnimeDto) {
    return this.favoriteAnimeService.createFav(data);
  }

  @Put('restore/:id')
  async restore(@Param('id') id: number) {
    return this.favoriteAnimeService.restoreFav(id);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return this.favoriteAnimeService.deleteFav(id);
  }
}
