import { Module } from '@nestjs/common';
import { PhotoTopicService } from './photo_topic.service';
import { PhotoTopicController } from './photo_topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoTopic } from './entities/photo_topic.entity';

@Module({
  controllers: [PhotoTopicController],
  providers: [PhotoTopicService],
  imports: [TypeOrmModule.forFeature([PhotoTopic])],
})
export class PhotoTopicModule {}
