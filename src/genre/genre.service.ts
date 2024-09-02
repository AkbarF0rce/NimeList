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

  async deleteGenre(id: string) {
    // Hapus data genre berdasarkan id yang diberikan
    const deleted = await this.genreRepository.softDelete(id);

    // Tampilkan pesan jika data berhasil di hapus
    if (deleted) {
      return `data deleted`;
    }
  }

  async updateGenre(id: string, updateGenreDto: CreateGenreDto) {
    // Update data genre berdasarkan id yang diberikan
    const updated = await this.genreRepository.update(id, updateGenreDto);

    // Tampilkan pesan jika data berhasil di update
    if (updated) {
      return `data updated`;
    }
  }
}
