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

  // Fungsi untuk membuat review
  async createReview(data: CreateReviewDto) {
    const exist = await this.reviewRepository.findOne({
      where: { id_anime: data.id_anime, id_user: data.id_user },
    });

    if (exist) {
      throw new BadRequestException('You have already reviewed this anime');
    }

    const post = this.reviewRepository.save(data);

    if (!post) {
      throw new BadRequestException('data not created');
    }

    throw new HttpException('data created', 201);
  }

  // Fungsi untuk mengupdate review
  async updateReview(id: string, data: UpdateReviewDto) {
    const review = await this.reviewRepository.findOne({
      where: { id: id },
      select: ['id_user'],
    });
    const { id_user, role, ...update } = data;

    // Cek apakah user memiliki akses untuk mengupdate data
    if (role === 'user' && id_user !== review.id_user) {
      throw new HttpException('you are not allowed to update this data', 403);
    }

    const updateReview = await this.reviewRepository.update(id, update);

    if (!updateReview) {
      throw new BadRequestException('data not updated');
    }

    throw new HttpException('data updated', 200);
  }

  // Fungsi untuk menghapus review
  async deleteReview(id: string, userId: string, role: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: id },
      select: ['id_user'],
    });

    // Cek apakah user memiliki akses untuk menghapus data
    if (role === 'user' && review.id_user !== userId) {
      throw new Error('you are not allowed to delete this data');
    }

    const deleted = await this.reviewRepository.delete(id);

    if (!deleted) {
      throw new BadRequestException('data not deleted');
    }

    throw new HttpException('data deleted', 200);
  }

  // Fungsi untuk mendapatkan semua review untuk admin dengan pagination
  async getAllReviewAdmin(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
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

    if (search) {
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

  // Fungsi untuk mendapatkan review berdasarkan id
  async getReviewById(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: id },
      relations: ['user', 'anime'],
      select: {
        id: true,
        review: true,
        rating: true,
        created_at: true,
        updated_at: true,
        user: {
          username: true,
        },
        anime: {
          title: true,
        },
      },
    });

    console.log(review);

    return {
      username: review.user.username,
      review: review.review,
      title_anime: review.anime.title,
      rating: review.rating,
      created_at: review.created_at,
      updated_at: review.updated_at,
    };
  }

  // Fungsi untuk mendapatkan daftar anime yang telah diulas oleh user
  async getAnimeReviewed(id_user: string) {
    const anime = await this.reviewRepository.find({
      where: { id_user: id_user },
      relations: ['anime'],
      select: {
        anime: {
          id: true,
        },
      },
    });

    return anime.map((anime) => anime.anime.id);
  }

  async getReviewByAnime(id_anime: string, page: number, limit: number) {
    const get = await this.reviewRepository.find({
      where: { id_anime: id_anime },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        rating: true,
        review: true,
        user: {
          username: true,
          name: true,
          status_premium: true,
        },
        created_at: true,
        updated_at: true,
      },
      order: { created_at: 'DESC' },
    });

    const total = await this.reviewRepository.count({
      where: { id_anime: id_anime },
    });

    const result = get.map((get) => ({
      id: get.id,
      username: get.user.username,
      name: get.user.name,
      status_premium: get.user.status_premium,
      rating: parseFloat(get.rating.toString()),
      review: get.review,
      created_at: get.created_at,
      updated_at: get.updated_at,
    }));

    return {
      data: result,
      total,
    }
  }

  // Fungsi untuk mendapatkan rata-rata rating berdasarkan id anime
  async getAvgRatingByAnime(id: string) {
    const review = await this.reviewRepository.average('rating', {
      id_anime: id,
    });

    if (!review) return 0;

    return Number(parseFloat(review.toString()).toFixed(1));
  }

  // Fungsi untuk mendapatkan daftar review berdasarkan id anime
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
          name: true,
          status_premium: true,
        },
        created_at: true,
        updated_at: true,
      },
      order: { created_at: 'DESC' },
    });

    return {
      data: reviews.map((review) => ({
        id: review.id,
        username: review.user.username,
        name: review.user.name,
        review: review.review,
        rating: parseFloat(review.rating.toString()),
        status_premium: review.user.status_premium,
        created_at: review.created_at,
        updated_at: review.updated_at,
      })),
      total,
    };
  }

  // Fungsi untuk mendapatkan rating berdasarkan id user
  async getUserRating(id_user: string, id_anime: string) {
    const rating = await this.reviewRepository.findOne({
      where: { id_user: id_user, id_anime: id_anime },
      select: ['rating'],
    });

    if (!rating) return 0;

    return Number(rating.rating);
  }
}
