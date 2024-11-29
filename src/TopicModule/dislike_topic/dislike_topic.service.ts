import { HttpException, Injectable } from '@nestjs/common';
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
    const saved = await this.dislikeTopicRepository.save(create);

    if (!saved) {
      throw new HttpException('data not created', 400);
    }

    throw new HttpException('data created', 201);
  }

  async deleteDislike(id_topic: string, id_user: string) {
    const deleted = await this.dislikeTopicRepository.delete({
      id_topic: id_topic,
      id_user: id_user,
    });

    if (!deleted) {
      throw new HttpException('data not deleted', 400);
    }

    // Tampilkan pesan data berhasil di hapus
    return {
      status: 200,
      message: 'data deleted',
    };
  }
}
