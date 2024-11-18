import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Anime } from 'src/AnimeModule/anime/entities/anime.entity';
import { User } from 'src/UserModule/user/entities/user.entity';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  imports: [TypeOrmModule.forFeature([Review, Anime, User])],
  exports: [ReviewService],
})
export class ReviewModule {}
