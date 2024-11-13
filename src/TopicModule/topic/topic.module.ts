import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { PhotoTopic } from 'src/TopicModule/photo_topic/entities/photo_topic.entity';
import { LikeTopic } from 'src/TopicModule/like_topic/entities/like_topic.entity';
import { Comment } from 'src/TopicModule/comment/entities/comment.entity';
import { Anime } from 'src/AnimeModule/anime/entities/anime.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
import { DislikeTopic } from 'src/TopicModule/dislike_topic/entities/dislike_topic.entity';
import { UserService } from 'src/UserModule/user/user.service';
import { PremiumGuard } from 'src/AuthModule/auth/guards/isPremium.guard';
import { UserModule } from 'src/UserModule/user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [TopicController],
  providers: [TopicService, PremiumGuard],
  imports: [
    TypeOrmModule.forFeature([
      Topic,
      PhotoTopic,
      LikeTopic,
      Comment,
      Anime,
      User,
      DislikeTopic,
    ]),
    UserModule,
    JwtModule
  ],
})
export class TopicModule {}
