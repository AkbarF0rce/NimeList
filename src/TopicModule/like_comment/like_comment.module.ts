import { Module } from '@nestjs/common';
import { LikeCommentService } from './like_comment.service';
import { LikeCommentController } from './like_comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeComment } from './entities/like_comment.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
import { Comment } from 'src/TopicModule/comment/entities/comment.entity';

@Module({
  controllers: [LikeCommentController],
  imports: [TypeOrmModule.forFeature([LikeComment, User, Comment])],
  providers: [LikeCommentService],
})
export class LikeCommentModule {}
