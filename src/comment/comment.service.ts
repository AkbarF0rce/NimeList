import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { error } from 'console';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  async createComment(data: CreateCommentDto) {
    const post = this.commentRepository.create(data);

    if (!post) {
      throw new Error('data not created');
    }

    return {
      message: 'data created',
      data: await this.commentRepository.save(post),
    };
  }

  async updateComment(id: number, data: UpdateCommentDto) {
    // Cari comment berdasarkan id yang diberikan
    const get = await this.commentRepository.findOne({
      where: { id },
    });

    // Jika comment tidak ada tampilkan pesan error
    if (!get) {
      throw new NotFoundException('data not found');
    }

    return {
      message: 'data updated',
      commentUpdate: await this.commentRepository.save({ ...get, ...data }),
    };
  }

  async deleteComment(id: number) {
    // Cari comment berdasarkan id yang diberikan
    const get = await this.commentRepository.findOne({
      where: { id },
    });

    // Jika comment tidak ada tampilkan pesan error
    if (!get) {
      throw new NotFoundException('data not found');
    }

    // Hapus comment dari database berdasarkan id
    await this.commentRepository.softDelete(id);

    return {
      message: 'data deleted',
    };
  }

  async restoreComment(id: number) {
    // Restore comment dari database berdasarkan id
    await this.commentRepository.restore(id);

    return {
      message: 'data restored',
    };
  }
}
