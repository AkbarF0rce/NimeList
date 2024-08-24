import { Module } from '@nestjs/common';
import { Review } from './reviews.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
    imports: [TypeOrmModule.forFeature([Review])],
    controllers: [ReviewsController],
    providers: [ReviewsService]
})
export class ReviewsModule {}
