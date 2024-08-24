import { Module } from '@nestjs/common';
import { PhotoAnimeService } from './photo_anime.service';
import { PhotoAnimeController } from './photo_anime.controller';
import { PhotoAnime } from './entities/photo_anime.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PhotoAnimeController],
  providers: [PhotoAnimeService],
  imports: [TypeOrmModule.forFeature([PhotoAnime])],
})
export class PhotoAnimeModule {}
