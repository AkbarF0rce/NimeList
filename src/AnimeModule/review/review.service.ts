import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { Anime } from 'src/AnimeModule/anime/entities/anime.entity';
import { status_premium, User } from 'src/UserModule/user/entities/user.entity';
import { parse } from 'path';
import { status } from 'src/TransactionModule/transaction/entities/transaction.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    @InjectRepository(Anime) private animeRepository: Repository<Anime>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createReview(data: CreateReviewDto) {
    const exist = await this.reviewRepository.findOne({
      where: { id_anime: data.id_anime, id_user: data.id_user },
    });

    if (exist) {
      throw new BadRequestException('You have already reviewed this anime');
    }

    const post = this.reviewRepository.create(data);

    if (!post) {
      throw new Error('data not created');
    }

    await this.reviewRepository.save(post);
    return {
      message: 'data created',
    };
  }

  async updateReview(id: string, data: UpdateReviewDto) {
    // Cari review berdasarkan id
    const review = await this.reviewRepository.findOne({
      where: { id: id },
      select: ['id_user'],
    });
    const { id_user, role, ...update } = data;

    if (role === 'user') {
      if (id_user !== review.id_user) {
        throw new HttpException('you are not allowed to update this data', 403);
      }

      return await this.reviewRepository.update(id, update);
    }

    return await this.reviewRepository.update(id, update);
  }

  async deleteReview(id: string, userId: string, role: string) {
    if (role === 'user') {
      if (userId !== id) {
        throw new Error('you are not allowed to delete this data');
      }

      return await this.reviewRepository.delete(id);
    }

    return await this.reviewRepository.delete(id);
  }

  async restoreReview(id: string) {
    // Restore data berdasarkan id
    await this.reviewRepository.restore({ id });

    // Tampilkan pesan data berhasil di restore
    return {
      message: 'data restored',
    };
  }

  async getAllReview(page: number = 1, limit: number = 10, search?: string) {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.user', 'user') // Join table review
      .leftJoin('review.anime', 'anime') // Join table review
      .select([
        'review.id',
        'review.rating',
        'user.username',
        'anime.title',
        'review.created_at',
        'review.updated_at',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('review.created_at', 'DESC');

    if (search && search !== '' && search !== null) {
      query
        .where('anime.title ILIKE :search', { search: `%${search}%` })
        .orWhere('user.username ILIKE :search', { search: `%${search}%` });
    }

    const [reviews, total] = await query.getManyAndCount();

    const result = reviews.map((review) => ({
      id: review.id,
      username: review.user.username,
      title_anime: review.anime.title,
      rating: review.rating,
      created_at: review.created_at,
      updated_at: review.updated_at,
    }));

    return {
      data: result,
      total,
    };
  }

  async getReviewById(id: string) {
    const review = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.user', 'user')
      .leftJoin('review.anime', 'anime')
      .select([
        'review.rating',
        'review.review',
        'user.username',
        'anime.title',
        'review.created_at',
        'review.updated_at',
      ])
      .where('review.id = :id', { id })
      .getOne();

    return {
      username: review.user.username,
      review: review.review,
      title_anime: review.anime.title,
      rating: review.rating,
      created_at: review.created_at,
      updated_at: review.updated_at,
    };
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

  async getAnimeReviewed(id: string) {
    const anime = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.anime', 'anime')
      .select(['review.id', 'review.rating', 'anime.id'])
      .where('review.id_user = :id', { id })
      .getMany();

    return anime.map((anime) => anime.anime.id);
  }

  async getAvgRatingByAnime(id: string) {
    const review = await this.reviewRepository.average('rating', {
      id_anime: id,
    });

    if (!review) return 0;

    return Number(parseFloat(review.toString()).toFixed(1));
  }

  async getAndCountByAnime(id: string) {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { id_anime: id },
      relations: ['user'],
      select: {
        id: true,
        rating: true,
        review: true,
        user: {
          username: true,
          status_premium: true,
        },
        created_at: true,
        updated_at: true,
      },
    });

    return {
      data: reviews.map((review) => ({
        id: review.id,
        username: review.user.username,
        review: review.review,
        rating: review.rating,
        status_premium: review.user.status_premium,
        created_at: review.created_at,
        updated_at: review.updated_at,
      })),
      total,
    };
  }

  async totalReviewsByUser(id: string) {
    return await this.reviewRepository.count({ where: { id_user: id } });
  }

  async getUserRating(id_user: string, id_anime: string) {
    const rating = await this.reviewRepository.findOne({
      where: { id_user: id_user, id_anime: id_anime },
      select: ['rating'],
    });

    return Number(rating.rating);
  }
}
