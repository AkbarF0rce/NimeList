import { Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from './entities/genre.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';

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
    await this.genreRepository.update(id, updateGenreDto);
  }

  async getAllGenre(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const [data, total] = await this.genreRepository.findAndCount({
      where: { name: ILike(`%${search}%`) },
      skip: (page - 1) * limit,
      take: limit,
      order: { name: order },
    });

    return {
      data,
      total,
    };
  }
}
