import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LikeCommentService } from './like_comment.service';
import { CreateLikeCommentDto } from './dto/create-like_comment.dto';
import { UpdateLikeCommentDto } from './dto/update-like_comment.dto';

@Controller('like-comment')
export class LikeCommentController {
  constructor(private readonly likeCommentService: LikeCommentService) {}

  @Post('post')
  async create(@Body() data: CreateLikeCommentDto) {
    return await this.likeCommentService.createLike(data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.likeCommentService.deleteLike(id);
  }
}
