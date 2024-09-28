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
  async update(@Param('id') id: string, @Body() data: UpdateCommentDto) {
    return await this.commentService.updateComment(id, data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.commentService.deleteComment(id);
  }

  @Put('restore/:id')
  async restore(@Param('id') id: string) {
    return await this.commentService.restoreComment(id);
  }

  @Get('get-all')
  async getAllComment() {
    return await this.commentService.getAllComment();
  }

  @Get('get/:id')
  async getCommentById(@Param('id') id: string) {
    return await this.commentService.getCommentById(id);
  }

  @Get('get-all-user')
  async getAllUser() {
    return await this.commentService.getAllUser();
  }

  @Get('get-all-topic')
  async getAllTopic() {
    return await this.commentService.getAllTopic();
  }
}
