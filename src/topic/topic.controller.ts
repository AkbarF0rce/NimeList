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
  UploadedFile,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { diskStorage } from 'multer';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
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
          destination: './images/topic/cover', // Sesuaikan destinasi storage sesuai keinginan
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
    return this.topicService.createTopic(createTopicDto, files.photos);
  }

  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'new_photos', maxCount: 4 }, // Limit file foto yang akan diupload sesuai keinginan
      ],
      {
        storage: diskStorage({
          destination: './images/topic/cover', // Sesuaikan destinasi storage sesuai keinginan
          filename: (req, file, cb) => {
            cb(null, `${v4()}${extname(file.originalname)}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(
              new Error('Hanya file gambar yang diperbolehkan!'),
              false,
            );
          }
          cb(null, true);
        },
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: CreateTopicDto,
    @Body('existing_photos') existingPhotosString: string[],
    @UploadedFiles()
    files: {
      new_photos?: Express.Multer.File[];
    },
  ) {
    return await this.topicService.updateTopic(
      id,
      files.new_photos || [],
      updateTopicDto,
      existingPhotosString,
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

  @Get('get-all')
  async getAllTopic() {
    return await this.topicService.getAllTopic();
  }

  @Get('get-all-anime')
  async getAllAnime() {
    return await this.topicService.getAllAnime();
  }

  @Get('get-all-user')
  async getAllUser() {
    return await this.topicService.getAllUser();
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './images/topic/body', // Folder penyimpanan lokal
        filename: (req, file, callback) => {
          // Membuat nama file baru berdasarkan tanggal dan ekstensi asli
          const fileExtName = extname(file.originalname);
          const fileName = `${v4()}${fileExtName}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async uploadImage(
    @UploadedFile()
    files: Express.Multer.File,
  ) {
    const response = {
      imageUrl: `http://localhost:4321/images/topic/body/${files.filename}`,
    };
    return response;
  }
}
