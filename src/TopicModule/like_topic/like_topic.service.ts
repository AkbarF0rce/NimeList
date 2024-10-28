import { Injectable } from '@nestjs/common';
import { CreateLikeTopicDto } from './dto/create-like_topic.dto';
import { LikeTopic } from './entities/like_topic.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LikeTopicService {
  constructor(
    @InjectRepository(LikeTopic)
    private readonly likeTopicRepository: Repository<LikeTopic>,
  ) {}

  async createLike(data: CreateLikeTopicDto) {
    // Membuat data like berdasarkan data yang diterima
    const create = await this.likeTopicRepository.create(data);
    await this.likeTopicRepository.save(create);

    // Tampilkan pesan data berhasil dibuat
    return {
      message: 'data created',
      data: create,
    };
  }

  async deleteLike (id: string) {
    // Hapus data like berdasarkan id
    await this.likeTopicRepository.delete(id);

    // Tampilkan pesan data berhasil di hapus
    return {
      message: 'data deleted',
    };
  }
}
