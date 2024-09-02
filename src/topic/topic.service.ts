import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { Repository } from 'typeorm';
import { PhotoTopic } from 'src/photo_topic/entities/photo_topic.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { NotFoundError } from 'rxjs';
import { LikeTopic } from 'src/like_topic/entities/like_topic.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
    @InjectRepository(PhotoTopic)
    private photoTopicRepository: Repository<PhotoTopic>,
    @InjectRepository(LikeTopic)
    private likeTopicRepository: Repository<LikeTopic>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  async createTopic(
    createTopicDto: CreateTopicDto,
    photos: Express.Multer.File[],
  ) {
    // Create topic
    const topic = this.topicRepository.create(createTopicDto);
    await this.topicRepository.save(topic);

    // Simpan photo jika ada
    if (photos && photos.length > 0) {
      for (const file of photos) {
        const photo = this.photoTopicRepository.create({
          file_path: file.path,
          topic,
        });
        await this.photoTopicRepository.save(photo);
      }
    }

    return {
      topic: topic,
      photos,
    };
  }

  // Fungsi untuk Menghitung hash SHA-256 dari isi file
  private calculateFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return '';

    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    return hashSum.digest('hex');
  }

  async updateTopic(
    id: string,
    photos: Express.Multer.File[],
    updateTopicDto: UpdateTopicDto,
  ) {
    // Cari topic berdasarkan id
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['photos'],
    });

    // Jika topic tidak ada tampilkan pesan error
    if (!topic) {
      throw new NotFoundException('Topic tidak ditemukan');
    }

    // Update informasi dasar topic
    Object.assign(topic, updateTopicDto);
    await this.topicRepository.save(topic);

    // Jika ada foto yang diupload
    if (photos && photos.length > 0) {
      // Hash file yang baru diupload
      const newPhotoHashes = photos.map((file) =>
        this.calculateFileHash(file.path),
      );

      // Identifikasi dan hapus foto lama yang tidak ada di file baru
      for (const photo of topic.photos) {
        const oldFilePath = join(process.cwd(), photo.file_path);
        const oldFileHash = this.calculateFileHash(oldFilePath);

        // Jika hash file lama tidak ditemukan dalam hash file baru, hapus file lama
        if (!newPhotoHashes.includes(oldFileHash)) {
          try {
            await unlink(oldFilePath); // Hapus file lama dari sistem
          } catch (err) {
            console.error('Error deleting old photo file:', err);
          }
          await this.photoTopicRepository.remove(photo); // Hapus data foto lama dari database
        }
      }

      // Simpan foto baru
      for (const file of photos) {
        const fileHash = this.calculateFileHash(file.path);

        // Cek apakah file ini sudah ada di dalam sistem berdasarkan hash dengan mencocokkan hash file dengan file yang sudah ada
        const isDuplicate = topic.photos.some((photo) => {
          const existingFileHash = this.calculateFileHash(
            join(process.cwd(), photo.file_path),
          );
          return existingFileHash === fileHash;
        });

        if (!isDuplicate) {
          const photo = this.photoTopicRepository.create({
            file_path: file.path,
            topic,
          });
          await this.photoTopicRepository.save(photo); // Simpan data foto baru
        } else {
          fs.unlinkSync(file.path);
        }
      }
    }

    return {
      message: 'Topic dan foto berhasil diperbarui',
      topicUpdate: topic,
    };
  }

  async deleteTopic(id: string) {
    // Cari topic berdasarkan id
    const topic = await this.topicRepository.findOne({ where: { id } });

    // Jika topic tidak ada tampilkan pesan error
    if (!topic) {
      throw new NotFoundException('Topic tidak ditemukan');
    }
    // Hapus topic dari database berdasarkan id
    await this.topicRepository.softDelete(id);

    // Tampilkan pesan saat data berhasil dihapus
    return {
      message: 'Data topic berhasil dihapus',
    };
  }

  async getTopicById(id: string) {
    const get = await this.topicRepository.findOne({
      where: { id },
      relations: ['anime', 'photos'],
    });

    if (!get) {
      throw new NotFoundException('Topic tidak ditemukan');
    }

    // Hitung total likes dari id topic yang diberikan
    const totalLikes = await this.likeTopicRepository
      .createQueryBuilder('likes')
      .where('likes.id_topic = :id', { id })
      .getCount();

    const totalComments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id_topic = :id', { id })
      .getCount();

    return {
      topic: get,
      totalLikes,
      totalComments,
    };
  }
}
