import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
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
    const deleted = await this.genreRepository.delete(id);

    // Tampilkan pesan jika data berhasil di hapus
    if (!deleted) {
      throw new HttpException('data not deleted', 400);
    }

    return {
      status: 200,
      message: 'data deleted',
    };
  }

  async updateGenre(id: string, updateGenreDto: CreateGenreDto) {
    // Update data genre berdasarkan id yang diberikan
    const updated = await this.genreRepository.update(id, updateGenreDto);

    if (!updated) {
      throw new HttpException('data not updated', 400);
    }

    // Tampilkan pesan jika data berhasil di update
    return {
      status: 200,
      message: 'data updated',
    };
  }

  async getById(id: string) {
    const get = await this.genreRepository.findOne({ where: { id } });
    if (!get) {
      throw new NotFoundException('data not found');
    }
    return get;
  }

  async getAll() {
    return await this.genreRepository.find();
  }

  async getAdmin(page: number = 1, limit: number = 10, search: string = '') {
    const [data, total] = await this.genreRepository.findAndCount({
      where: { name: ILike(`%${search}%`) },
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data,
      total,
    };
  }

  async getByAnime(id: string) {
    const get = await this.genreRepository.find({
      where: { animes: { id } },
      select: ['id', 'name'],
    });
    return get;
  }
}
