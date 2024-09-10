import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/topic/entities/topic.entity';
import { User } from 'src/user/entities/user.entity';
import { Anime } from 'src/anime/entities/anime.entity';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [TypeOrmModule.forFeature([Topic, User, Anime])],
})
export class DashboardModule {}
