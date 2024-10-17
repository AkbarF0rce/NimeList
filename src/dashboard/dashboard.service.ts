import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from 'src/topic/entities/topic.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Anime } from 'src/anime/entities/anime.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}
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

  // Fungsi untuk mendapatkan nama bulan berdasarkan angka
  private getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  }

  async getIncomeData(year: number) {
    const transactions = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('EXTRACT(MONTH FROM transaction.created_at) as month')
      .addSelect('SUM(transaction.total) as total_income')
      .where('EXTRACT(YEAR FROM transaction.created_at) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Format hasil query ke dalam bentuk array bulanan
    const incomeData = transactions.map((transaction) => ({
      month: this.getMonthName(transaction.month),
      income: parseFloat(transaction.total_income),
    }));

    return incomeData;
  }
}
