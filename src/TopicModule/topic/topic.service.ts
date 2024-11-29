import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { Repository } from 'typeorm';
import { PhotoTopic } from 'src/TopicModule/photo_topic/entities/photo_topic.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { LikeTopic } from 'src/TopicModule/like_topic/entities/like_topic.entity';
import { Comment } from 'src/TopicModule/comment/entities/comment.entity';
import * as fs from 'fs';
import { Anime } from 'src/AnimeModule/anime/entities/anime.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
import { DislikeTopic } from 'src/TopicModule/dislike_topic/entities/dislike_topic.entity';
import slugify from 'slugify';
import { v4 } from 'uuid';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
    @InjectRepository(PhotoTopic)
    private photoTopicRepository: Repository<PhotoTopic>,
    @InjectRepository(LikeTopic)
    private likeTopicRepository: Repository<LikeTopic>,
    @InjectRepository(DislikeTopic)
    private dislikeTopicRepository: Repository<DislikeTopic>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Anime) private animeRepository: Repository<Anime>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createTopic(
    createTopicDto: CreateTopicDto,
    photos: Express.Multer.File[],
  ) {
    // Generate slug dengan sebagian uuid
    createTopicDto.slug = `tt-${v4().split('-')[0]}`;

    const topic = this.topicRepository.create(createTopicDto);
    const savedTopic = await this.topicRepository.save(topic);

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

    if (!savedTopic) {
      throw new BadRequestException('Topic not created');
    }

    throw new HttpException('Topic created', 201);
  }

  private async updateTopic(id: string, updateTopicDto: UpdateTopicDto) {
    // Cari topic berdasarkan id
    const topic = await this.topicRepository.findOne({
      where: { id: id },
      relations: ['photos'],
    });

    if (topic.title !== updateTopicDto.title) {
      updateTopicDto.slug = `tt-${v4().split('-')[0]}`;
    }

    const { existing_photos, photos, id_user, role, ...update } =
      updateTopicDto;

    // Jika topic tidak ada tampilkan pesan error
    if (!topic) {
      throw new NotFoundException('Topic tidak ditemukan');
    }

    // Update informasi dasar topic
    Object.assign(topic, update);
    const savedTopic = await this.topicRepository.save(topic);

    if (!savedTopic) {
      throw new BadRequestException('Topic not updated');
    }

    // Hapus data foto lama
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
            id_topic: id,
          });
          await this.photoTopicRepository.save(photo);
        });

      console.log(newPhotos);
    }

    throw new HttpException('Topic updated', 200);
  }

  async update(id: string, updateTopicDto: UpdateTopicDto) {
    const getTopicCreated = await this.topicRepository.findOne({
      where: { id },
      select: ['id_user'],
    });

    if (
      updateTopicDto.role === 'user' &&
      updateTopicDto.id_user !== getTopicCreated.id_user
    ) {
      throw new BadRequestException('you are not allowed to update this data');
    }

    return await this.updateTopic(id, updateTopicDto);
  }

  async deleteTopic(id: string, userId: string, role: string) {
    // Cari topic berdasarkan id
    const topic = await this.topicRepository.findOne({ where: { id } });

    // Jika topic tidak ada tampilkan pesan error
    if (!topic) {
      throw new NotFoundException('Topic tidak ditemukan');
    }

    if (role === 'user' && userId !== topic.id_user) {
      throw new Error('you are not allowed to delete this data');
    }

    const deleted = await this.topicRepository.softDelete(id);

    if (!deleted) {
      throw new BadRequestException('Topic not deleted');
    }

    // Tampilkan pesan saat data berhasil dihapus
    throw new HttpException('Topic deleted successfully', 200);
  }

  async getAll() {
    const get = await this.topicRepository.find({
      order: { created_at: 'DESC' },
      relations: ['user', 'anime'],
      select: {
        id: true,
        title: true,
        slug: true,
        created_at: true,
        updated_at: true,
        user: {
          name: true,
        },
        anime: {
          title: true,
        },
      },
    });

    return get.map((data) => ({
      id: data.id,
      title: data.title,
      slug: data.slug,
      created_at: data.created_at,
      updated_at: data.updated_at,
      username: data.user.name,
      title_anime: data.anime.title,
    }));
  }

  async getTopicBySlug(slug: string) {
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
      .where('topic.slug = :slug', { slug })
      .getOne();

    const likes = await this.likeTopicRepository
      .createQueryBuilder('like')
      .where('like.id_topic = :id', { id: get.id })
      .getCount();

    const dislikes = await this.dislikeTopicRepository
      .createQueryBuilder('dislike')
      .where('dislike.id_topic = :id', { id: get.id })
      .getCount();

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id_topic = :id', { id: get.id })
      .getCount();

    return {
      ...get,
      user: get.user.username,
      anime: get.anime.title,
      totalLikes: likes,
      totalComments: comments,
      totalDislikes: dislikes,
    };
  }

  async getAllTopic(page: number, limit: number, search: string) {
    const [topics, total] = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.user', 'user') // Join table user yang berelasi dengan topic
      .leftJoinAndSelect('topic.anime', 'anime') // Join table photos yang berelasi dengan topic
      .select([
        'topic.id',
        'topic.title',
        'topic.created_at',
        'topic.updated_at',
        'topic.slug',
        'user', // Ambil username dari tabel user
        'anime', // Ambil title dari tabel anime
      ])
      .orderBy('topic.created_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .where('anime.title ILIKE :search', { search: `%${search}%` })
      .orWhere('user.username ILIKE :search', { search: `%${search}%` })
      .orWhere('topic.title ILIKE :search', { search: `%${search}%` })
      .getManyAndCount();

    // Tampilkan semua topik dengan username user yang terkait
    const data = topics.map((topic) => ({
      ...topic,
      user: topic.user.username,
      anime: topic.anime.title,
    }));

    return {
      data,
      total,
    };
  }

  async getAndCountByAnime(id: string) {
    const [topics, total] = await this.topicRepository.findAndCount({
      where: { id_anime: id },
      relations: ['user'],
      select: {
        id: true,
        title: true,
        created_at: true,
        updated_at: true,
        user: {
          username: true,
        },
      },
    });

    return {
      data: topics,
      total,
    };
  }
}
