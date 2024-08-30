import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('post')
  async create(@Body() data: CreateCommentDto) {
    return await this.commentService.createComment(data);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() data: UpdateCommentDto) {
    return await this.commentService.updateComment(id, data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return await this.commentService.deleteComment(id);
  }

  @Put('restore/:id')
  async restore(@Param('id') id: number) {
    return await this.commentService.restoreComment(id);
  }
}
