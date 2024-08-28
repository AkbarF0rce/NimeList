import { Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from './entities/genre.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre) private genreRepository: Repository<Genre>,
  ) {}
  async createGenre(data: CreateGenreDto) {
    const addGenre = await this.genreRepository.create(data);
    await this.genreRepository.save(addGenre);
    return { message: 'data created', genreName: data.name };
  }

  findAll() {
    return `This action returns all genre`;
  }

  findOne(id: number) {
    return `This action returns a #${id} genre`;
  }

  update(id: number, updateGenreDto: UpdateGenreDto) {
    return `This action updates a #${id} genre`;
  }

  async deleteGenre(id: number) {
    const deleted = await this.genreRepository.delete(id);
    if (deleted) {
      return `data deleted`;
    }
  }

  async updateGenre(id: number, updateGenreDto: CreateGenreDto) {
    // Update data genre berdasarkan id yang diberikan
    const updated = await this.genreRepository.update(id, updateGenreDto);

    // Tampilkan pesan jika data di update
    if (updated) {
      return `data updated`;
    }
  }
}
