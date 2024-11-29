import { Module } from '@nestjs/common';
import { LikeTopicService } from './like_topic.service';
import { LikeTopicController } from './like_topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeTopic } from './entities/like_topic.entity';
import { Topic } from 'src/TopicModule/topic/entities/topic.entity';
import { PremiumGuard } from 'src/AuthModule/auth/guards/isPremium.guard';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/UserModule/user/user.module';

@Module({
  controllers: [LikeTopicController],
  providers: [LikeTopicService, PremiumGuard],
  imports: [TypeOrmModule.forFeature([LikeTopic, Topic]), JwtModule, UserModule],
})
export class LikeTopicModule {}
