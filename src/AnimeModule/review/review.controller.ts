import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { get } from 'http';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('post')
  @UseGuards(JwtAuthGuard)
  async post(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    createReviewDto.id_user = req.user.userId;
    return await this.reviewService.createReview(createReviewDto);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    updateReviewDto.id_user = req.user.userId;
    updateReviewDto.role = req.user.role;

    return await this.reviewService.updateReview(id, updateReviewDto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req) {
    return await this.reviewService.deleteReview(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  @Get('get-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.reviewService.getAllReview(page, limit, search);
  }

  @Get('get/:id')
  async get(@Param('id') id: string) {
    return await this.reviewService.getReviewById(id);
  }

  @Get('user-rating')
  @UseGuards(JwtAuthGuard)
  async getUserRating(@Request() req, @Query('id_anime') id_anime: string) {
    return await this.reviewService.getUserRating(req.user.userId, id_anime);
  }
}
