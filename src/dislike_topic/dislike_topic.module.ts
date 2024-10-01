import { Module } from '@nestjs/common';
import { DislikeTopicService } from './dislike_topic.service';
import { DislikeTopicController } from './dislike_topic.controller';

@Module({
  controllers: [DislikeTopicController],
  providers: [DislikeTopicService],
})
export class DislikeTopicModule {}
