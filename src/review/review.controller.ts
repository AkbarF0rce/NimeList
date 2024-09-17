import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { get } from 'http';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('post')
  async create(@Body() createReviewDto: CreateReviewDto) {
    return await this.reviewService.createReview(createReviewDto);
  }

  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return await this.reviewService.updateReview(id, updateReviewDto);
  }

  @Put('restore/:id')
  async restore(@Param('id') id: string) {
    return await this.reviewService.restoreReview(id);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.reviewService.deleteReview(id);
  }

  @Get('get-all')
  async getAll() {
    return await this.reviewService.getAllReview();
  }

  @Get('get-all-anime')
  async getAllAnime() {
    return await this.reviewService.getAllAnime();
  }

  @Get('get-all-user')
  async getAllUser() {
    return await this.reviewService.getAllUser();
  }

  @Get('get/:id')
  async get(@Param('id') id: string) {
    return await this.reviewService.getReviewById(id);
  }

  @Get('anime-reviewed/:id')
  async getAnimeReviewed(@Param('id') id: string) {
    return await this.reviewService.getAnimeReviewed(id);
  }
}
