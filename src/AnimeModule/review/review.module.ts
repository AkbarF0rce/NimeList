import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Anime } from 'src/AnimeModule/anime/entities/anime.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
import { PhotoProfileModule } from 'src/UserModule/photo_profile/photo_profile.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  imports: [
    TypeOrmModule.forFeature([Review, Anime, User]),
    PhotoProfileModule,
  ],
  exports: [ReviewService],
})
export class ReviewModule {}
