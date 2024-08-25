import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post('post')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 4 }, // You can limit the number of photos
      ],
      {
        storage: diskStorage({
          destination: 'src/photo_topic/photos/', // Adjust the path based on your needs
          filename: (req, file, cb) => {
            cb(null, `${file.originalname}`);
          },
        }),
      },
    ),
  )
  create(
    @Body() createTopicDto: CreateTopicDto,
    @UploadedFiles() files: { photos?: Express.Multer.File[] }
  ) {
    return this.topicService.create(createTopicDto, files.photos || []);
  }
}

