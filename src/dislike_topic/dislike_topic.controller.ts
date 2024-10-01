import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { DislikeTopicService } from './dislike_topic.service';
import { CreateDislikeTopicDto } from './dto/create-dislike_topic.dto';

@Controller('dislike-topic')
export class DislikeTopicController {
  constructor(private readonly dislikeTopicService: DislikeTopicService) {}

  @Post()
  async create(@Body() createDislikeTopicDto: CreateDislikeTopicDto) {
    return await this.dislikeTopicService.createDislike(createDislikeTopicDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.dislikeTopicService.deleteDislike(id);
  }
}
