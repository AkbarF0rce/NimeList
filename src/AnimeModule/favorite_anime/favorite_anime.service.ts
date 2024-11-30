import { BadRequestException, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
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
      throw new BadRequestException('data not created');
    }

    await this.favoriteAnimeRepository.save(create);

    throw new HttpException('data created', 201);
  }

  async deleteFav(id_user: string, id_anime: string) {
    // Hapus data like berdasarkan id user
    const get = await this.favoriteAnimeRepository.findOne({
      where: { id_anime: id_anime, id_user: id_user },
      select: ['id_user', 'id'],
    });

    if (get.id_user !== id_user) {
      throw new ForbiddenException('you are not allowed to delete this data');
    }

    const deleted = await this.favoriteAnimeRepository.delete(get.id);

    if (!deleted) {
      throw new BadRequestException('data not deleted');
    }

    // Tampilkan pesan data berhasil di hapus
    throw new HttpException('data deleted', 200);
  }

  async userFavorites(id: string) {
    const get = await this.favoriteAnimeRepository.find({
      where: { id_user: id },
    });

    return get.map((get) => get.id_anime);
  }
}
