import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/TopicModule/topic/entities/topic.entity';
import { User } from 'src/UserModule/user/entities/user.entity';
import { Anime } from 'src/AnimeModule/anime/entities/anime.entity';
import { Transaction } from 'src/TransactionModule/transaction/entities/transaction.entity';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [TypeOrmModule.forFeature([Topic, User, Anime, Transaction])],
})
export class DashboardModule {}
