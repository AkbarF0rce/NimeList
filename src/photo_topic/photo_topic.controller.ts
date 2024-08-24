import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PhotoTopicService } from './photo_topic.service';
import { CreatePhotoTopicDto } from './dto/create-photo_topic.dto';
import { UpdatePhotoTopicDto } from './dto/update-photo_topic.dto';

@Controller('photo-topic')
export class PhotoTopicController {
  constructor(private readonly photoTopicService: PhotoTopicService) {}

  @Post()
  create(@Body() createPhotoTopicDto: CreatePhotoTopicDto) {
    return this.photoTopicService.create(createPhotoTopicDto);
  }

  @Get()
  findAll() {
    return this.photoTopicService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.photoTopicService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhotoTopicDto: UpdatePhotoTopicDto) {
    return this.photoTopicService.update(+id, updatePhotoTopicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.photoTopicService.remove(+id);
  }
}
