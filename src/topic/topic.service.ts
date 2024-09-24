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
import { Anime } from 'src/anime/entities/anime.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
    @InjectRepository(PhotoTopic)
    private photoTopicRepository: Repository<PhotoTopic>,
    @InjectRepository(LikeTopic)
    private likeTopicRepository: Repository<LikeTopic>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Anime) private animeRepository: Repository<Anime>,
    @InjectRepository(User) private userRepository: Repository<User>,
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
    existing_photos: string[],
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

    // Identifikasi dan hapus foto lama yang tidak ada di file baru
    for (const photo of topic.photos) {
      const oldFilePath = join(process.cwd(), photo.file_path);

      // Cek apakah existing_photos memberikan path yang tidak ada di dalam sistem
      if (!existing_photos.includes(photo.file_path)) {
        try {
          await unlink(oldFilePath); // Hapus file lama dari sistem
        } catch (err) {
          console.error('Error deleting old photo file:', err);
        }
        await this.photoTopicRepository.remove(photo); // Hapus data foto lama dari database
      }
    }

    if (photos && photos.length > 0) {
      // Simpan foto baru
      const newPhotos = photos
        .filter((file) => !existing_photos.includes(file.path)) // Hanya simpan file dan path baru yang belum ada di database
        .map(async (file) => {
          const photo = this.photoTopicRepository.create({
            file_path: file.path,
            topic,
          });
          await this.photoTopicRepository.save(photo);
        });
    }
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
    const get = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoin('topic.user', 'user')
      .leftJoin('topic.anime', 'anime')
      .leftJoin('topic.photos', 'photos')
      .select([
        'topic.id',
        'topic.title',
        'topic.created_at',
        'topic.updated_at',
        'user',
        'anime',
        'topic.body',
        'photos.file_path',
      ])
      .where('topic.id = :id', { id })
      .getOne();

    const likes = await this.likeTopicRepository
      .createQueryBuilder('like')
      .where('like.id_topic = :id', { id })
      .getCount();

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id_topic = :id', { id })
      .getCount();

    return {
      ...get,
      user: get.user.username,
      anime: get.anime.title,
      id_anime: get.anime.id,
      totalLikes: likes,
      totalComments: comments,
    };
  }

  async getAllTopic() {
    const topics = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.user', 'user') // Join table user yang berelasi dengan topic
      .leftJoinAndSelect('topic.anime', 'anime') // Join table photos yang berelasi dengan topic
      .select([
        'topic.id',
        'topic.title',
        'topic.created_at',
        'topic.updated_at',
        'user.username', // Ambil username dari tabel user
        'anime.title', // Ambil title dari tabel anime
      ])
      .getMany();

    // Tampilkan semua topik dengan username user yang terkait
    return topics.map((topic) => ({
      ...topic,
      user: topic.user.username,
      anime: topic.anime.title,
    }));
  }

  async getAllAnime() {
    const animes = await this.animeRepository
      .createQueryBuilder('anime')
      .select(['anime.id', 'anime.title'])
      .getMany();

    return animes.map((anime) => ({
      id: anime.id,
      title: anime.title,
    }));
  }

  async getAllUser() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .select(['user.id', 'user.username'])
      .where('role.name = :roleName', { roleName: 'user' })
      .getMany();

    return users.map((user) => ({
      id: user.id,
      username: user.username,
    }));
  }
}
