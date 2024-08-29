import { Module } from '@nestjs/common';
import { LikeTopicService } from './like_topic.service';
import { LikeTopicController } from './like_topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeTopic } from './entities/like_topic.entity';
import { Topic } from 'src/topic/entities/topic.entity';

@Module({
  controllers: [LikeTopicController],
  providers: [LikeTopicService],
  imports: [TypeOrmModule.forFeature([LikeTopic, Topic])],
})
export class LikeTopicModule {}
