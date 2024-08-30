import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { PhotoTopic } from 'src/photo_topic/entities/photo_topic.entity';
import { LikeTopic } from 'src/like_topic/entities/like_topic.entity';
import { Comment } from 'src/comment/entities/comment.entity';

@Module({
  controllers: [TopicController],
  providers: [TopicService],
  imports: [TypeOrmModule.forFeature([Topic, PhotoTopic, LikeTopic, Comment])],
})
export class TopicModule {}
