import { Injectable } from '@nestjs/common';
import { CreateLikeCommentDto } from './dto/create-like_comment.dto';
import { UpdateLikeCommentDto } from './dto/update-like_comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeComment } from './entities/like_comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikeCommentService {
  constructor(
    @InjectRepository(LikeComment) private likeCommentRepository: Repository<LikeComment>,
  ) {}

  async createLike(data: CreateLikeCommentDto) {
    // Membuat data like berdasarkan data yang diterima
    const create = await this.likeCommentRepository.create(data);
    await this.likeCommentRepository.save(create);  

    // Tampilkan pesan data berhasil dibuat
    return {
      message: 'data created',
      data: create,
    };
  }

  async deleteLike(id: string) {
    // Hapus data like berdasarkan id
    return {
      message: 'data deleted',
      data: await this.likeCommentRepository.delete(id),
    }
  }
}
