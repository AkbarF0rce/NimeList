import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { PhotoTopic } from 'src/photo_topic/entities/photo_topic.entity';
import { LikeTopic } from 'src/like_topic/entities/like_topic.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Anime } from 'src/anime/entities/anime.entity';
import { User } from 'src/user/entities/user.entity';
import { DislikeTopic } from 'src/dislike_topic/entities/dislike_topic.entity';

@Module({
  controllers: [TopicController],
  providers: [TopicService],
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
  ],
})
export class TopicModule {}
