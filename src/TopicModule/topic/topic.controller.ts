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
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { diskStorage } from 'multer';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { v4 } from 'uuid';
import * as sanitize from 'sanitize-html';
import { extname } from 'path';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { Premium } from 'src/TransactionModule/premium/entities/premium.entity';
import { PremiumGuard } from 'src/AuthModule/auth/guards/isPremium.guard';
import { UpdateTopicDto } from './dto/update-topic.dto';

@UseGuards(PremiumGuard, JwtAuthGuard)
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
    const sanitizedHtml = this.filterHtmlContent(createTopicDto.body);

    return this.topicService.createTopic(
      { ...createTopicDto, body: sanitizedHtml },
      files.photos,
    );
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
    @Request() req,
    @Body() updateTopicDto: UpdateTopicDto,
    @UploadedFiles()
    files: {
      new_photos?: Express.Multer.File[];
    },
  ) {
    updateTopicDto.body = this.filterHtmlContent(updateTopicDto.body);
    updateTopicDto.photos = files.new_photos || [];
    updateTopicDto.id_user = req.user.userId;
    updateTopicDto.role = req.user.role;

    return await this.topicService.update(
      id,
      updateTopicDto,
    );
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string, @Request() req) {
    return await this.topicService.deleteTopic(id, req.user.userId, req.user.role);
  }

  @Get('get/:id')
  async getTopicById(@Param('id') id: string) {
    return await this.topicService.getTopicById(id);
  }

  @Get('get-admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllTopic(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return await this.topicService.getAllTopic(page, limit, search);
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
}
