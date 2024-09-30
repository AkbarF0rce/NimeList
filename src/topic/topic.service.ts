import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { Repository } from 'typeorm';
import { PhotoTopic } from 'src/photo_topic/entities/photo_topic.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { LikeTopic } from 'src/like_topic/entities/like_topic.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import * as fs from 'fs';
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

  // Helper function to extract image sources from HTML content
  private extractImageSources(content: string): string[] {
    const imageSources: string[] = [];
    const regex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = regex.exec(content)) !== null) {
      let src = match[1];
      src = src.replace('http://localhost:4321', '');
      imageSources.push(src);
    }

    return imageSources;
  }

  // Helper function to delete old images
  private async deleteOldImages(images: string[]) {
    if (images.length > 0) {
      for (const img of images) {
        const oldFilePath = join(process.cwd(), img);
        // Cek apakah existing_photos memberikan path yang tidak ada di dalam sistem
        try {
          await unlink(oldFilePath); // Hapus file lama dari sistem
        } catch (err) {
          console.error('Error deleting old photo file:', err);
        }
      }
    }
  }

  async createTopic(
    createTopicDto: CreateTopicDto,
    photos: Express.Multer.File[],
  ) {
    // Create data baru untuk topic
    const topic = this.topicRepository.create(createTopicDto);
    await this.topicRepository.save(topic);

    // Mengambil semua data topic
    const existingTopic = await this.topicRepository.find();

    if (existingTopic.length > 0) {
      const images = []; // Array untuk menyimpan path gambar yang ada dalam database
      for (const exist of existingTopic) {
        const existImg = this.extractImageSources(exist.body);
        if (existImg.length > 0) {
          images.push(existImg); // Menyimpan path gambar yang ada ke dalam array
        }
      }

      const filesInFolder = await fs.promises.readdir('./images/topic/body'); // Mengambil semua path file yang ada di dalam folder
      const existFolderFileUrl = filesInFolder.map((file) => {
        return `/images/topic/body/${file}`; // Menyimpan path gambar yang ada dalam folder ke dalam array
      });

      const deletedImages = existFolderFileUrl.filter(
        (file) => !images.includes(file),
      ); // Melakukan penghapusan jika ada path gambar dalam folder yang tidak sesuai dengan path yang ada

      if (deletedImages.length > 0) {
        this.deleteOldImages(deletedImages);
      }
    }

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

    // Mengambil semua data topic
    const existTopic = await this.topicRepository.find();

    if (existTopic.length > 0) {
      const images = []; // Array untuk menyimpan path gambar yang ada dalam database
      for (const exist of existTopic) {
        const existImg = this.extractImageSources(exist.body);
        if (existImg.length > 0) {
          images.push(existImg); // Menyimpan path gambar ke dalam array
        }
      }
      const filesInFolder = await fs.promises.readdir('./images/topic/body'); // Mengambil semua path file yang ada di dalam folder
      const existFolderFileUrl = filesInFolder.map((file) => {
        return `/images/topic/body/${file}`; // Menyimpan path gambar yang ada dalam folder ke dalam array
      });
      console.log(existFolderFileUrl);

      const deletedImages = existFolderFileUrl.filter(
        (img) => !images.includes(img),
      ); // Melakukan penghapusan jika ada path gambar dalam folder yang tidak sesuai dengan path yang ada

      console.log(deletedImages);

      if (deletedImages.length > 0) {
        this.deleteOldImages(deletedImages);
      }
    }

    if (photos && photos.length > 0) {
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
