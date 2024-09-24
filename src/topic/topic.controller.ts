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
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { v4 } from 'uuid';
import { extname } from 'path';
import * as sanitize from 'sanitize-html';
import * as path from 'path';
import * as fs from 'fs';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post('post')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photos', maxCount: 1 }, // Limit file foto yang akan diupload sesuai keinginan
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
    const cleanBody = this.processImagesInContent(createTopicDto.body);

    const updatedBody = this.filterHtmlContent(cleanBody);

    return this.topicService.createTopic({
      ...createTopicDto,
      body: updatedBody,
    }, files.photos);
  }

  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'new_photos', maxCount: 4 }, // Limit file foto yang akan diupload sesuai keinginan
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

  // Fungsi untuk memfilter dan sanitasi HTML content
  private filterHtmlContent(html: string): string {
    const allowedTags = [
      'p',
      'b',
      'i',
      'strong',
      'em',
      'h1',
      'h2',
      'h3',
      'a',
      'img',
      'ul',
      'li',
      'ol',
      'blockquote',
    ];
    return sanitize(html, {
      allowedTags,
      allowedAttributes: {
        a: ['href', 'name', 'target'],
        img: ['src', 'alt', 'title', 'width', 'height'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
    });
  }

  // Function to process images and save them to the folder
  private processImagesInContent(content: string): string {
    const imageTagRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    let updatedContent = content;

    while ((match = imageTagRegex.exec(content)) !== null) {
      const imgSrc = match[1];

      // Check if the image is base64 encoded
      if (imgSrc.startsWith('data:image/')) {
        const base64Data = imgSrc.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Generate file name and save image to folder
        const fileName = `${v4()}.jpg`; // Use timestamp for unique file names
        const filePath = path.join(process.cwd(), 'images', 'topic', 'body', fileName);

        // Save the image to the folder
        fs.writeFileSync(filePath, imageBuffer);

        // Update the image source in the content
        updatedContent = updatedContent.replace(
          imgSrc,
          `/images/topic/body/${fileName}`,
        );
      }
    }

    return updatedContent;
  }
}
