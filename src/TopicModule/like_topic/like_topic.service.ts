import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLikeTopicDto } from './dto/create-like_topic.dto';
import { LikeTopic } from './entities/like_topic.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { status } from 'src/TransactionModule/transaction/entities/transaction.entity';

@Injectable()
export class LikeTopicService {
  constructor(
    @InjectRepository(LikeTopic)
    private readonly likeTopicRepository: Repository<LikeTopic>,
  ) {}

  async createLike(data: CreateLikeTopicDto) {
    if (!data.id_user || !data.id_topic) {
      throw new NotFoundException('user or topic not found');
    }

    const check = await this.likeTopicRepository.findOne({
      where: {
        id_topic: data.id_topic,
        id_user: data.id_user,
      },
    });

    if (check) {
      throw new BadRequestException('data already exist');
    }

    // Membuat data like berdasarkan data yang diterima
    const create = await this.likeTopicRepository.create(data);
    const saved = await this.likeTopicRepository.save(create);

    if (!saved) {
      throw new HttpException('data not created', 400);
    }

    // Tampilkan pesan data berhasil dibuat
    return {
      message: 'data created',
      status: 200,
    };
  }

  async deleteLike(id_topic: string, id_user: string) {
    if (!id_user || !id_topic) {
      throw new NotFoundException('user or topic not found');
    }

    const deleted = await this.likeTopicRepository.delete({
      id_topic: id_topic,
      id_user: id_user,
    });

    if (!deleted) {
      throw new HttpException('data not deleted', 400);
    }

    // Tampilkan pesan data berhasil di hapus
    return {
      message: 'data deleted',
      status: 200,
    };
  }

  async getUserLikes(id_user: string) {
    return await this.likeTopicRepository.find({
      where: { id_user: id_user },
      select: { id_topic: true },
    });
  }
}
