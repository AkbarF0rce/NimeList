import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Put,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { v4 } from 'uuid';
import { extname } from 'path';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post('post')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 4 }, // Limit file foto yang akan diupload sesuai keinginan
      ],
      {
        storage: diskStorage({
          destination: './images/topic', // Sesuaikan destinasi storage sesuai keinginan
          filename: (req, file, cb) => {
            cb(null, `${v4()}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async create(
    @Body() createTopicDto: CreateTopicDto,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ) {
    return await this.topicService.createTopic(
      createTopicDto,
      files.photos || [],
    );
  }

  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 4 }, // Limit file foto yang akan diupload sesuai keinginan
      ],
      {
        storage: diskStorage({
          destination: './images/topic', // Sesuaikan destinasi storage sesuai keinginan
          filename: (req, file, cb) => {
            cb(null, `${v4()}${extname(file.originalname)}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
          }
          cb(null, true);
        }
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: CreateTopicDto,
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
    },
  ) {
    return await this.topicService.updateTopic(
      id,
      files.photos || [],
      updateTopicDto,
    );
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.topicService.deleteTopic(id);
  }

  @Get('get/:id')
  async getTopicById(@Param('id') id: string) {
    return await this.topicService.getTopicById(id);
  }
}
