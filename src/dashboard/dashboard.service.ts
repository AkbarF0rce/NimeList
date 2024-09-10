import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from 'src/topic/entities/topic.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Anime } from 'src/anime/entities/anime.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
  ){}
  async getTotalTopic() {
    return { totalTopic: await this.topicRepository.count() };
  }

  async countUserPremium() {
    const count = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName: 'user' })
      .andWhere('user.status_premium = :premiumStatus', {
        premiumStatus: 'active',
      })
      .getCount();

    return {
      totalUserPremium: count,
    };
  }

  async getAnimeTopAllTime() {
    const get = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoin('anime.review', 'reviews')
      .addSelect('COUNT (reviews.id)', 'reviewcount')
      .addSelect('COALESCE(AVG(reviews.rating), 0)', 'avgrating')
      .groupBy('anime.id')
      .orderBy('avgrating', 'DESC')
      .addOrderBy('reviewcount', 'DESC')
      .limit(10)
      .getRawMany();

    return get.map((anime) => ({
      title: anime.anime_title,
      rating: parseFloat(anime.avgrating).toFixed(1),
      totalReview: anime.reviewcount,
    }));
  }
}
