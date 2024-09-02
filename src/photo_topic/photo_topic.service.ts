import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhotoTopicDto } from './dto/create-photo_topic.dto';
import { UpdatePhotoTopicDto } from './dto/update-photo_topic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PhotoTopic } from './entities/photo_topic.entity';
import { Repository } from 'typeorm';
import { join } from 'path';
import { unlink } from 'fs/promises';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class PhotoTopicService {
  constructor(
    @InjectRepository(PhotoTopic)
    private photoTopicRepository: Repository<PhotoTopic>,
  ) {}

   // Fungsi untuk Menghitung hash SHA-256 dari isi file
   private calculateFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return '';

    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    return hashSum.digest('hex');
  }

  async updatePhoto(id: string, files: Express.Multer.File) {
    // Cari foto berdasarkan id yang diberikan
    const photos = await this.photoTopicRepository.findOne({
      where: { id },
    });

    if (!photos) {
      throw new NotFoundException('Photo tidak ditemukan');
    }

    if (files) {
      const fileHash = this.calculateFileHash(files.path);
      const existingHash = this.calculateFileHash(photos.file_path);

      if (existingHash !== fileHash) {
        // Hapus file cover lama di sistem
        const Path = join(process.cwd(), photos.file_path);
        try {
          await unlink(Path); // Hapus file cover lama dari sistem
        } catch (err) {
          console.error('Error hapus data file foto: ', err);
        }

        // Ubah path cover dengan path yang baru
        photos.file_path = files.path;

        // Simpan file path foto yang baru
        await this.photoTopicRepository.save(photos);
        
        return {
          message: 'Foto berhasil diperbarui',
          filePhoto: photos,
        };
      } else {
        fs.unlinkSync(files.path);
        return {
          message: 'foto tidak ada yang baru',
        };
      }
    }
  }
}
