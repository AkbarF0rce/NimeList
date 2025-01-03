import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { LikeTopicService } from './like_topic.service';
import { CreateLikeTopicDto } from './dto/create-like_topic.dto';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { PremiumGuard } from 'src/AuthModule/auth/guards/isPremium.guard';

@Controller('like-topic')
@UseGuards(JwtAuthGuard, PremiumGuard)
export class LikeTopicController {
  constructor(private readonly likeTopicService: LikeTopicService) {}

  @Post('post')
  async create(@Body() data: CreateLikeTopicDto, @Request() req) {
    data.id_user = req.user.userId;
    return await this.likeTopicService.createLike(data);
  }

  @Delete('delete')
  async delete(@Body('id_topic') id_topic: string, @Request() req) {
    return await this.likeTopicService.deleteLike(id_topic, req.user.userId);
  }

  @Get('get-user-like')
  async getUserLikes(@Request() req, @Query('id_topic') id_topic: string) {
    return await this.likeTopicService.getUserLike(req.user.userId, id_topic);
  }
}
