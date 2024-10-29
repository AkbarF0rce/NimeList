import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/AuthModule/user/entities/user.entity';
import { Topic } from 'src/TopicModule/topic/entities/topic.entity';
import { LikeComment } from 'src/TopicModule/like_comment/entities/like_comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
    @InjectRepository(LikeComment)
    private likeCommentRepository: Repository<LikeComment>,
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

  async getAllCommentAdmin(page: number, limit: number, search: string) {
    const [data, total] = await this.commentRepository
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
      .orderBy('comment.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .where('user.username ILIKE :search', { search: `%${search}%` })
      .orWhere('topic.title ILIKE :search', { search: `%${search}%` })
      .getManyAndCount();

    const result = data.map((comment) => ({
      ...comment,
      user: comment.user.username,
      topic: comment.topic.title,
    }));

    return {
      data: result,
      total,
    };
  }

  async getCommentById(id: string) {
    const get = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.topic', 'topic')
      .select(['comment', 'user', 'topic'])
      .where('comment.id = :id', { id })
      .getOne();

    const likes = await this.likeCommentRepository
      .createQueryBuilder('like')
      .where('like.id_comment = :id', { id })
      .getCount();

    return {
      comment: get.comment,
      created_at: get.created_at,
      updated_at: get.updated_at,
      user: get.user.username,
      topic: get.topic.title,
      likes: likes,
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
