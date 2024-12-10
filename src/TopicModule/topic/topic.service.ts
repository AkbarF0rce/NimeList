import {
  BadRequestException,
  ForbiddenException,
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
import { unlink } from 'fs/promises';
import { LikeTopic } from 'src/TopicModule/like_topic/entities/like_topic.entity';
import { Comment } from 'src/TopicModule/comment/entities/comment.entity';
import { DislikeTopic } from 'src/TopicModule/dislike_topic/entities/dislike_topic.entity';
import { v4 } from 'uuid';
import { CommentService } from '../comment/comment.service';

const imageStorage = process.env.IMAGE_STORAGE;

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
    private readonly commentService: CommentService,
  ) {}

  // Fungsi untuk membuat topic
  async createTopic(
    createTopicDto: CreateTopicDto,
    photos: Express.Multer.File[],
  ) {
    // Generate slug dengan sebagian uuid
    createTopicDto.slug = `tt-${v4().split('-')[0]}`;
    const topic = this.topicRepository.create(createTopicDto);

    if (!photos || photos.length === 0) {
      throw new BadRequestException('Photo is required');
    }

    const savedTopic = await this.topicRepository.save(topic);

    if (!savedTopic) {
      if (photos) {
        for (const file of photos) {
          unlink(file.path);
        }
      }
      throw new BadRequestException('Topic not created');
    }

    // Simpan photo jika ada dan berhasil simpan topik
    if (savedTopic && photos && photos.length > 0) {
      for (const file of photos) {
        const photo = this.photoTopicRepository.create({
          file_path: file.path,
          topic,
        });
        await this.photoTopicRepository.save(photo);
      }
    }

    throw new HttpException('Topic created', 201);
  }

  // Fungsi untuk mengupdate topic
  private async updateTopic(id: string, updateTopicDto: UpdateTopicDto) {
    // Cari topic berdasarkan id
    const topic = await this.topicRepository.findOne({
      where: { id: id },
      relations: ['photos'],
    });

    // Jika topic tidak ada tampilkan pesan error
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.title !== updateTopicDto.title) {
      updateTopicDto.slug = `tt-${v4().split('-')[0]}`;
    }

    const { existing_photos, photos, id_user, role, ...update } =
      updateTopicDto;

    // Update informasi dasar topic
    Object.assign(topic, update);
    const savedTopic = await this.topicRepository.save(topic);

    if (!savedTopic) {
      if (photos) {
        for (const file of photos) {
          unlink(file.path);
        }
      }
      throw new BadRequestException('Topic not updated');
    }

    // Hapus data foto lama
    for (const photo of topic.photos) {
      // Cek apakah existing_photos memberikan path yang tidak ada di dalam sistem
      if (
        !existing_photos.includes(photo.file_path) &&
        existing_photos.length > 0
      ) {
        try {
          unlink(`${imageStorage}/${photo.file_path}`); // Hapus file lama dari sistem
        } catch (err) {
          throw new BadRequestException('photo not deleted');
        }
        await this.photoTopicRepository.remove(photo); // Hapus data foto lama dari database
      }
    }

    if (savedTopic && photos && photos.length > 0) {
      // Simpan foto baru
      photos
        .filter((file) => !existing_photos.includes(file.filename)) // Hanya simpan file dan path baru yang belum ada di database
        .map(async (file) => {
          const photo = this.photoTopicRepository.create({
            file_path: file.filename,
            id_topic: id,
          });
          await this.photoTopicRepository.save(photo);
        });
    }

    throw new HttpException('Topic updated', 200);
  }

  // Fungsi untuk melakukan cek sebelum update topic
  async update(id: string, updateTopicDto: UpdateTopicDto) {
    const getTopicCreated = await this.topicRepository.findOne({
      where: { id },
      select: ['id_user'],
    });

    // Verifikasi apakah pengguna memiliki akses untuk melakukan update
    if (
      updateTopicDto.role === 'user' &&
      updateTopicDto.id_user !== getTopicCreated.id_user
    ) {
      throw new ForbiddenException('you are not allowed to update this data');
    }

    return await this.updateTopic(id, updateTopicDto);
  }

  // Fungsi untuk menghapus topic
  async deleteTopic(id: string, userId: string, role: string) {
    // Cari topic berdasarkan id
    const topic = await this.topicRepository.findOne({ where: { id } });

    // Jika topic tidak ada tampilkan pesan error
    if (!topic) {
      throw new NotFoundException('Topic tidak ditemukan');
    }

    // Verifikasi apakah pengguna memiliki akses untuk melakukan delete
    if (role === 'user' && userId !== topic.id_user) {
      throw new Error('you are not allowed to delete this data');
    }

    const deleted = await this.topicRepository.softDelete(id);

    if (!deleted) {
      throw new BadRequestException('Topic not deleted');
    }

    throw new HttpException('Topic deleted successfully', 200);
  }

  // Fungsi untuk mendapatkan semua topic
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

  // Fungsi untuk mendapatkan topic berdasarkan slug
  async getTopicBySlug(slug: string) {
    const get = await this.topicRepository.findOne({
      where: { slug: slug },
      relations: ['user', 'anime', 'photos'],
      select: {
        id: true,
        title: true,
        body: true,
        created_at: true,
        updated_at: true,
        user: {
          username: true,
        },
        anime: {
          title: true,
        },
      },
    });

    get.photos = get.photos.map((photo) => photo.file_path) as [];

    const likes = await this.likeTopicRepository.count({
      where: { id_topic: get.id },
    });

    const dislikes = await this.dislikeTopicRepository.count({
      where: { id_topic: get.id },
    });

    const commentData = await this.commentService.getCommentByTopic(get.id);

    return {
      ...get,
      comments: commentData.data,
      user: get.user.username,
      anime: get.anime.title,
      totalLikes: likes || 0,
      totalComments: commentData.total || 0,
      totalDislikes: dislikes || 0,
    };
  }

  // Fungsi untuk mendapatkan semua topic untuk admin dengan pagination
  async getAllTopicAdmin(page: number, limit: number, search: string) {
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

  // Fungsi untuk mendapatkan semua topic berdasarkan id anime
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
