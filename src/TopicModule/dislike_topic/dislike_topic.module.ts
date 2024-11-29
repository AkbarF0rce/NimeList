import { Module } from '@nestjs/common';
import { DislikeTopicService } from './dislike_topic.service';
import { DislikeTopicController } from './dislike_topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DislikeTopic } from './entities/dislike_topic.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/UserModule/user/user.module';

@Module({
  controllers: [DislikeTopicController],
  providers: [DislikeTopicService],
  imports: [TypeOrmModule.forFeature([DislikeTopic]), JwtModule, UserModule],
})
export class DislikeTopicModule {}
