import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { PremiumGuard } from 'src/AuthModule/auth/guards/isPremium.guard';
import { Role } from 'src/UserModule/role/entities/role.entity';
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';

@Controller('comment')
@UseGuards(JwtAuthGuard, PremiumGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('post')
  async create(@Body() data: CreateCommentDto) {
    return await this.commentService.createComment(data);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateCommentDto, @Request() req) {
    data.id_user = req.user.userId;
    data.role = req.user.role;
    return await this.commentService.updateComment(id, data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string, @Request() req) {
    return await this.commentService.deleteComment(id,  req.user);
  }

  @Put('restore/:id')
  async restore(@Param('id') id: string) {
    return await this.commentService.restoreComment(id);
  }

  @Get('get-admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllComment(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return await this.commentService.getAllCommentAdmin(page, limit, search);
  }

  @Get('get/:id')
  async getCommentById(@Param('id') id: string) {
    return await this.commentService.getCommentById(id);
  }

  @Get('get-all-user')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllUser() {
    return await this.commentService.getAllUser();
  }

  @Get('get-all-topic')
  async getAllTopic() {
    return await this.commentService.getAllTopic();
  }
}
