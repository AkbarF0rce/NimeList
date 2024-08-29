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
import { LikeTopicService } from './like_topic.service';
import { CreateLikeTopicDto } from './dto/create-like_topic.dto';
import { UpdateLikeTopicDto } from './dto/update-like_topic.dto';

@Controller('like-topic')
export class LikeTopicController {
  constructor(private readonly likeTopicService: LikeTopicService) {}

  @Post('post')
  async create(@Body() data: CreateLikeTopicDto) {
    return await this.likeTopicService.createLike(data);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return await this.likeTopicService.deleteLike(id);
  }

  @Put('restore/:id')
  async restore(@Param('id') id: number) {
    return await this.likeTopicService.restoreLike(id); 
  }
}
