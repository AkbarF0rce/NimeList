import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { Anime } from 'src/anime/entities/anime.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    @InjectRepository(Anime) private animeRepository: Repository<Anime>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createReview(data: CreateReviewDto) {
    const post = await this.reviewRepository.create(data);

    if (!post) {
      throw new Error('data not created');
    }

    return {
      message: 'data created',
      data: await this.reviewRepository.save(post),
    };
  }

  async updateReview(id: string, data: UpdateReviewDto) {
    // Cari review berdasarkan id yang diberikan
    const get = await this.reviewRepository.findOne({
      where: { id },
    });

    // Jika data tidak ada tampilkan pesan error
    if (!get) {
      throw new NotFoundException('data not found');
    }

    return {
      message: 'data updated',
      data: await this.reviewRepository.save({ ...get, ...data }), 
    };
  }

  async deleteReview(id: string) {
    // Cari review berdasarkan id yang diberikan
    const get = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!get) {
      throw new NotFoundException('data not found');
    }

    // Hapus data berdasarkan id
    await this.reviewRepository.softDelete({ id });

    // Tampilkan pesan data berhasil dihapus
    return {
      message: 'data deleted',
    };
  }

  async restoreReview(id: string) {
    // Restore data berdasarkan id
    await this.reviewRepository.restore({ id });

    // Tampilkan pesan data berhasil di restore
    return {
      message: 'data restored',
    };
  }

  async getAllReview() {
    const reviews = await this.reviewRepository
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
      .getMany();

    return reviews.map((review) => ({
      id: review.id,
      username: review.user.username,
      title_anime: review.anime.title,
      rating: review.rating,
      created_at: review.created_at,
      updated_at: review.updated_at,
    }));
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
}
