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

    await this.favoriteAnimeRepository.save(create);

    return {
      status: 200,
      message: 'data created',
    };
  }

  async deleteFav(id_user: string, id_anime: string) {
    // Hapus data like berdasarkan id user
    await this.favoriteAnimeRepository.delete({ id_user, id_anime });

    // Tampilkan pesan data berhasil di hapus
    return {
      status: 200,
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

  async totalFavsByUser(id: string) {
    return await this.favoriteAnimeRepository.count({
      where: { id_user: id },
    });
  }

  async userFavorites(id: string) {
    const get = await this.favoriteAnimeRepository.find({
      where: { id_user: id },
    });

    return get.map((get) => get.id_anime);
  }

  async byUserAndAnime(id_user: string, id_anime: string) {
    const get = await this.favoriteAnimeRepository.findOne({
      where: { id_user, id_anime },
    });

    if (get) {
      return true;
    }
  }
}
