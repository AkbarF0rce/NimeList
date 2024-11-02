import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { Genre } from 'src/AnimeModule/genre/entities/genre.entity';
import { PhotoAnime } from 'src/AnimeModule/photo_anime/entities/photo_anime.entity';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { Topic } from 'src/TopicModule/topic/entities/topic.entity';
import { FavoriteAnime } from 'src/AnimeModule/favorite_anime/entities/favorite_anime.entity';
import { Review } from 'src/AnimeModule/review/entities/review.entity';
import { AuthModule } from 'src/AuthModule/auth/auth.module';

@Module({
  controllers: [AnimeController],
  providers: [AnimeService],
  imports: [
    TypeOrmModule.forFeature([
      Anime,
      Genre,
      PhotoAnime,
      Topic,
      Review,
      FavoriteAnime,
    ]),
    AuthModule
  ],
})
export class AnimeModule {}
