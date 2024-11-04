import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { LikeComment } from 'src/TopicModule/like_comment/entities/like_comment.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
import { Topic } from 'src/TopicModule/topic/entities/topic.entity';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [TypeOrmModule.forFeature([Comment, LikeComment, User, Topic])],
})
export class CommentModule {}
