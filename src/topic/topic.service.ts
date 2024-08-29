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

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
    @InjectRepository(PhotoTopic)
    private photoTopicRepository: Repository<PhotoTopic>,
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

  async updateTopic(
    id: number,
    photos: Express.Multer.File[],
    updateTopicDto: CreateTopicDto,
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
      // Identifikasi dan hapus foto lama yang tidak ada di file baru
      for (const photo of topic.photos) {
        const oldFilePath = join(process.cwd(), photo.file_path);
        try {
          await unlink(oldFilePath); // Hapus file lama dari sistem
        } catch (err) {
          console.error('Error deleting old photo file:', err);
        }
        await this.photoTopicRepository.remove(photo); // Hapus data foto lama dari database
      }

      // Simpan foto baru
      for (const file of photos) {
        const photo = this.photoTopicRepository.create({
          file_path: file.path,
          topic,
        });
        await this.photoTopicRepository.save(photo); // Simpan data foto baru
      }
    }

    return {
      message: 'Topic dan foto berhasil diperbarui',
      topicUpdate: topic,
    };
  }

  async deleteTopic(id: number) {
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

  async getTopicById(id: number) {
    const get = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoin('topic.likes', 'like')
      .where('topic.id = :id', { id })
      .addSelect('COUNT(like.id)', 'totalLike')
      .groupBy('topic.id')
      .getRawMany();

    return get;
  }
}
