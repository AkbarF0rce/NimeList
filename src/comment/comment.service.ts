import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { Topic } from 'src/topic/entities/topic.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
  ) {}

  async createComment(data: CreateCommentDto) {
    const post = this.commentRepository.save(data);

    if (!post) {
      throw new Error('data not created');
    }    
  }

  async updateComment(id: string, data: UpdateCommentDto) {
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
      data: await this.commentRepository.save({ ...get, ...data }),
    };
  }

  async deleteComment(id: string) {
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

  async getAllComment() {
    const data = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.topic', 'topic')
      .select([
        'comment.id',
        'comment.created_at',
        'comment.updated_at',
        'user',
        'topic',
      ])
      .getMany();

    return data.map((comment) => ({
      id: comment.id,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: comment.user.username,
      topic: comment.topic.title,
    }));
  }

  async getCommentById(id: string) {
    const get = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.topic', 'topic')
      .select(['comment', 'user', 'topic'])
      .where('comment.id = :id', { id })
      .getOne();

    return {
      comment: get.comment,
      created_at: get.created_at,
      updated_at: get.updated_at,
      user: get.user.username,
      topic: get.topic.title,
    };
  }

  async restoreComment(id: string) {
    // Restore comment dari database berdasarkan id
    await this.commentRepository.restore(id);

    return {
      message: 'data restored',
    };
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

  async getAllTopic() {
    const topic = await this.topicRepository
      .createQueryBuilder('topic')
      .select(['topic'])
      .getMany();

    return topic.map((anime) => ({
      id: anime.id,
      title: anime.title,
    }));
  }
}
