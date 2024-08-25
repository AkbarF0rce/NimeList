import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { PhotoTopic } from 'src/photo_topic/entities/photo_topic.entity';

@Module({
  controllers: [TopicController],
  providers: [TopicService],
  imports: [TypeOrmModule.forFeature([Topic, PhotoTopic])],
})
export class TopicModule {}
