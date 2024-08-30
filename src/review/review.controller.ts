import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('post')
  async create(@Body() createReviewDto: CreateReviewDto) {
    return await this.reviewService.createReview(createReviewDto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() updateReviewDto: UpdateReviewDto) {
    return await this.reviewService.updateReview(id, updateReviewDto);
  }

  @Put('restore/:id')
  async restore(@Param('id') id: number) {
    return await this.reviewService.restoreReview(id);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return await this.reviewService.deleteReview(id);
  }
}
