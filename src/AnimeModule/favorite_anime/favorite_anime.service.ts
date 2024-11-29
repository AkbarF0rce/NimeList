import { HttpException, Injectable } from '@nestjs/common';
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
    const get = await this.favoriteAnimeRepository.findOne({
      where: { id_anime: id_anime, id_user: id_user },
      select: ['id_user', 'id'],
    });

    if (get.id_user !== id_user) {
      throw new HttpException('you are not allowed to delete this data', 403);
    }

    const deleted = await this.favoriteAnimeRepository.delete(get.id);

    if (!deleted) {
      throw new HttpException('data not deleted', 400);
    }

    // Tampilkan pesan data berhasil di hapus
    return {
      status: 200,
      message: 'data deleted',
    };
  }

  async userFavorites(id: string) {
    const get = await this.favoriteAnimeRepository.find({
      where: { id_user: id },
    });

    return get.map((get) => get.id_anime);
  }
}
