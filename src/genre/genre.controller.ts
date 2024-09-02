import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post('post')
  async create(@Body() createGenreDto: CreateGenreDto) {
    return await this.genreService.createGenre(createGenreDto);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.genreService.deleteGenre(id);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() updateGenreDto: CreateGenreDto) {
    return await this.genreService.updateGenre(id, updateGenreDto);
  }
}
