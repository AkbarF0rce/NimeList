import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { LikeComment } from 'src/like_comment/entities/like_comment.entity';
import { LikeTopic } from 'src/like_topic/entities/like_topic.entity';
import { Topic } from 'src/topic/entities/topic.entity';
import { Review } from 'src/review/entities/review.entity';
import { FavoriteAnime } from 'src/favorite_anime/entities/favorite_anime.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      LikeComment,
      LikeTopic,
      Topic,
      Review,
      FavoriteAnime,
      Role
    ]),
  ],
  exports: [UserService],
})
export class UserModule {}
