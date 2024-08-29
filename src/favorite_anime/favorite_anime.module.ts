import { Module } from '@nestjs/common';
import { FavoriteAnimeService } from './favorite_anime.service';
import { FavoriteAnimeController } from './favorite_anime.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteAnime } from './entities/favorite_anime.entity';

@Module({
  controllers: [FavoriteAnimeController],
  providers: [FavoriteAnimeService],
  imports: [TypeOrmModule.forFeature([FavoriteAnime])],
})
export class FavoriteAnimeModule {}
