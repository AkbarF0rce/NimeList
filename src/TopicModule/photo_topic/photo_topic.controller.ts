import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PhotoTopicService } from './photo_topic.service';
import { CreatePhotoTopicDto } from './dto/create-photo_topic.dto';
import { UpdatePhotoTopicDto } from './dto/update-photo_topic.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';
import { extname } from 'path';
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';

@Controller('photo-topic')
@UseGuards(RolesGuard, JwtAuthGuard)
@Roles('admin')
export class PhotoTopicController {
  constructor(private readonly photoTopicService: PhotoTopicService) {}

  @Put('update/:id')
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
  async updatePhoto(
    @Param('id') id: string,
    @UploadedFiles() file: { photos?: Express.Multer.File[] },
  ) {
    return await this.photoTopicService.updatePhoto(id, file?.photos?.[0]);
  }

  @Delete('delete/:id')
  async deletePhoto(@Param('id') id: string) {
    return await this.photoTopicService.deletePhoto(id);
  }

  @Get('get-admin')
  async getAllPhotos(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.photoTopicService.getAllPhotos(page, limit, search);
  }

  @Get('get/:id')
  async getPhotoById(@Param('id') id: string) {
    return await this.photoTopicService.getPhotoById(id);
  }
}
