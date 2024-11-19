import { Injectable } from '@nestjs/common';
import { CreateFavoriteAnimeDto } from './dto/create-favorite_anime.dto';
import { UpdateFavoriteAnimeDto } from './dto/update-favorite_anime.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoriteAnime } from './entities/favorite_anime.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteAnimeService {
  constructor(
    @InjectRepository(FavoriteAnime)
    private favoriteAnimeRepository: Repository<FavoriteAnime>,
  ) {}

  async createFav(data: CreateFavoriteAnimeDto) {
    const create = await this.favoriteAnimeRepository.create(data);

    if (!create) {
      throw new Error('data not created');
    }

    return {
      message: 'data created',
      data: await this.favoriteAnimeRepository.save(create),
    };
  }

  async deleteFav(id: string) {
    // Hapus data like berdasarkan id
    await this.favoriteAnimeRepository.softDelete(id);

    // Tampilkan pesan data berhasil di hapus
    return {
      message: 'data deleted',
    };
  }

  async restoreFav(id: string) {
    // Restore data like berdasarkan id
    await this.favoriteAnimeRepository.restore(id);

    // Tampilkan pesan data berhasil di restore
    return {
      message: 'data restored',
    };
  }
}
