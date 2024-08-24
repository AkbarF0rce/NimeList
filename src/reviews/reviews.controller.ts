import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './reviews.dto';
import { get } from 'http';

@Controller('review')
export class ReviewsController {
    constructor(private ReviewsService: ReviewsService){}

    @Post('post')
    postReview(@Body() data : CreateReviewDto){
        return this.ReviewsService.createReview(data);
    }

    @Get('get')
    getAllReview(){
        return this.ReviewsService.getAll();
    }

    @Get('get/:id')
    getReviewById(@Param('id') id: number ){
        return this.ReviewsService.getByid(id);
    }

    @Put('update/:id')
    updateReview(@Param('id') id: number, @Body() data : CreateReviewDto){
        return this.ReviewsService.updateReview(id, data);
    }

    @Delete('delete/:id')
    deleteReview(@Param('id') id: number){
        return this.ReviewsService.deleteReview(id);
    }
}
