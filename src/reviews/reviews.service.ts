import { Injectable } from '@nestjs/common';
import { Review } from './reviews.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReviewDto } from './reviews.dto';
import { UpdateReviewDto } from './reviewUpdate.dto';

@Injectable()
export class ReviewsService {
    constructor ( @InjectRepository(Review) private reviewsRepository: Repository<Review>){    }

    async getAll(){
        return await this.reviewsRepository.find({relations: {anime: true}})
    }

    async getByid(id: number){
        return await this.reviewsRepository.find({where: { id_review: id }, relations: {anime: true}})
    }

    async createReview(data : CreateReviewDto){
        const review =  await this.reviewsRepository.create(data);
        return await this.reviewsRepository.save(review);
    }

    async updateReview(id: number, data : UpdateReviewDto){
        await this.reviewsRepository.update({id_review: id}, data);
        return await this.reviewsRepository.find({where: { id_review: id }});
    }

    async deleteReview(id: number){
        await this.reviewsRepository.delete({id_review: id});
        return 'data deleted';
    }
}
