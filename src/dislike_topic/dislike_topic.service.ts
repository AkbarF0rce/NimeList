import { Injectable } from '@nestjs/common';
import { CreateDislikeTopicDto } from './dto/create-dislike_topic.dto';
import { DislikeTopic } from './entities/dislike_topic.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DislikeTopicService {
  constructor(
    @InjectRepository(DislikeTopic)
    private readonly dislikeTopicRepository: Repository<DislikeTopic>,
  ) {}

  async createDislike(data: CreateDislikeTopicDto) {
    // Membuat data like berdasarkan data yang diterima
    const create = await this.dislikeTopicRepository.create(data);
    await this.dislikeTopicRepository.save(create);
  }

  async deleteDislike (id: string) {
    // Hapus data like berdasarkan id
    await this.dislikeTopicRepository.delete(id);

    // Tampilkan pesan data berhasil di hapus
    return {
      message: 'data deleted',
    };
  }
}
