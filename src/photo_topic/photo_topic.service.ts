import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhotoTopicDto } from './dto/create-photo_topic.dto';
import { UpdatePhotoTopicDto } from './dto/update-photo_topic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PhotoTopic } from './entities/photo_topic.entity';
import { Repository } from 'typeorm';
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class PhotoTopicService {
  constructor(
    @InjectRepository(PhotoTopic)
    private photoTopicRepository: Repository<PhotoTopic>,
  ) {}

  async updatePhoto(id: number, files: Express.Multer.File) {
    // Cari foto berdasarkan id yang diberikan
    const photos = await this.photoTopicRepository.findOne({
      where: { id },
    });

    if (!photos) {
      throw new NotFoundException('Photo tidak ditemukan');
    }

    const Path = join(process.cwd(), photos.file_path);
    try {
      await unlink(Path);
    } catch (err) {
      console.error('Error hapus data file foto: ', err);
    }

    // Update path file di database
    photos.file_path = files[0].path;
    await this.photoTopicRepository.save(photos);

    return {
      message: 'Foto berhasil diperbarui',
      filePhoto: photos,
    };
  }
}
