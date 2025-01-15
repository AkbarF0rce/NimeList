import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
import { Topic } from 'src/TopicModule/topic/entities/topic.entity';
import { LikeComment } from 'src/TopicModule/like_comment/entities/like_comment.entity';
import { PhotoProfileService } from 'src/UserModule/photo_profile/photo_profile.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
    private readonly photoProfileService: PhotoProfileService,
  ) {}

  async createComment(data: CreateCommentDto) {
    const post = await this.commentRepository.save(data);

    if (!post) {
      throw new Error('data not created');
    }

    throw new HttpException('data created', 201);
  }

  async updateComment(id: string, data: UpdateCommentDto) {
    // Cari comment berdasarkan id yang diberikan
    const get = await this.commentRepository.findOne({
      where: { id },
    });

    const { id_user, role, ...update } = data;

    // Jika comment tidak ada tampilkan pesan error
    if (!get) {
      throw new NotFoundException('data not found');
    }

    if (get.id_user !== id_user && role === 'user') {
      throw new HttpException('you are not allowed to update this data', 403);
    }

    const updated = await this.commentRepository.update(id, update);

    if (!updated) {
      throw new BadRequestException('data not updated');
    }

    throw new HttpException('data updated', 200);
  }

  async deleteComment(id: string, user: any) {
    // Cari comment berdasarkan id yang diberikan
    const get = await this.commentRepository.findOne({
      where: { id },
    });

    const topicCreated = await this.topicRepository.findOne({
      where: { id: get.id_topic },
      select: ['id_user'],
    });

    // Jika comment tidak ada tampilkan pesan error
    if (!get) {
      throw new NotFoundException('data not found');
    }

    // Jika comment tidak dibuat oleh user yang login dan pembuat topik, tampilkan pesan error
    if (
      get.id_user !== user.id &&
      user.role === 'user' &&
      topicCreated.id_user !== user.userId
    ) {
      throw new ForbiddenException('you are not allowed to delete this data');
    }

    // Hapus comment dari database berdasarkan id
    const deleted = await this.commentRepository.delete(id);

    // Jika comment tidak terhapus tampilkan pesan error
    if (!deleted) {
      throw new BadRequestException('data not deleted');
    }

    throw new HttpException('data deleted', 200);
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

  async getCommentByTopic(
    id: string,
    page: number,
    limit: number,
    id_user?: string,
  ) {
    const [data, total] = await this.commentRepository.findAndCount({
      where: { id_topic: id },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'likes'],
      order: { created_at: 'DESC' },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        comment: true,
        user: {
          username: true,
          name: true,
          id: true,
        },
      },
    });

    const result = await Promise.all(
      data.map(async (comment) => {
        const liked = comment.likes.some((like) => like.id_user === id_user);

        // Panggil getPhoto secara asinkron
        const user_photo = await this.photoProfileService.getPhoto(
          comment.user.id,
        );

        return {
          id: comment.id,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          comment: comment.comment,
          name: comment.user.name,
          username: comment.user.username,
          total_likes: comment.likes.length,
          user_photo,
          liked, // Status apakah user telah menyukai komentar ini
        };
      }),
    );

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
      .leftJoin('comment.likes', 'likes')
      .select(['comment', 'user.username', 'topic.title'])
      .addSelect('COUNT(likes.id)', 'total_likes')
      .where('comment.id = :id', { id })
      .groupBy('comment.id, user.username, topic.title')
      .getRawOne();

    return {
      comment: get.comment_comment,
      created_at: get.comment_created_at,
      updated_at: get.comment_updated_at,
      user: get.user_username,
      topic: get.topic_title,
      likes: get.total_likes,
    };
  }
}
