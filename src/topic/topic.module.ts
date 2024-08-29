import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { PhotoTopic } from 'src/photo_topic/entities/photo_topic.entity';
import { LikeTopic } from 'src/like_topic/entities/like_topic.entity';

@Module({
  controllers: [TopicController],
  providers: [TopicService],
  imports: [TypeOrmModule.forFeature([Topic, PhotoTopic, LikeTopic])],
})
export class TopicModule {}
