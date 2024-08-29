import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anime } from './entities/anime.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { PhotoAnime } from 'src/photo_anime/entities/photo_anime.entity';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { Topic } from 'src/topic/entities/topic.entity';
import { Review } from 'src/reviews/reviews.entity';
import { FavoriteAnime } from 'src/favorite_anime/entities/favorite_anime.entity';

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
  ],
})
export class AnimeModule {}
