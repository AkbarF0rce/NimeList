import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
  ) {}

  async createReview(data: CreateReviewDto){
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
    })

    // Jika data tidak ada tampilkan pesan error
    if(!get) {
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
      where: {id}
    })

    if(!get){
      throw new NotFoundException('data not found')
    }

    // Hapus data berdasarkan id
    await this.reviewRepository.softDelete({ id });

    // Tampilkan pesan data berhasil dihapus
    return {
      message: "data deleted"
    }
  }

  async restoreReview(id: string) {
    // Restore data berdasarkan id
    await this.reviewRepository.restore({ id });

    // Tampilkan pesan data berhasil di restore
    return {
      message: "data restored"
    }
  }
}
