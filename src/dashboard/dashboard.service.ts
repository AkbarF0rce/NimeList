import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from 'src/TopicModule/topic/entities/topic.entity';
import { Repository } from 'typeorm';
import { User } from 'src/UserModule/user/entities/user.entity';
import { Transaction } from 'src/TransactionModule/transaction/entities/transaction.entity';
import { Anime } from 'src/AnimeModule/anime/entities/anime.entity';

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

  async getTop10AnimeAllTime() {
    // Mencari semua data anime dan relasi review
    const allAnimes = await this.animeRepository.find({
      select: ['id', 'title'],
      relations: ['review'],
    });

    const totalRatings = allAnimes.reduce((sum, anime) => {
      const animeTotalRating = anime.review.reduce(
        (total, review) => total + Number(review.rating),
        0,
      );
      return sum + animeTotalRating;
    }, 0);

    const totalReviews = allAnimes.reduce(
      (sum, anime) => sum + anime.review.length,
      0,
    );

    const avgRatingAllAnime = totalRatings / totalReviews; // Rata-rata rating semua anime

    // Jumlah minimum review yang diperlukan
    const minReviews = 3;

    // Hitung Weighted Rating (WR) untuk setiap anime
    const data = allAnimes
      .map((anime) => {
        const totalReviews = anime.review.length;
        const avgRatingAnime =
          totalReviews > 0
            ? anime.review.reduce(
                (total, review) => total + Number(review.rating),
                0,
              ) / totalReviews
            : 0;

        // Hanya hitung weighted rating untuk anime dengan jumlah review lebih atau sama dari minimum review
        if (totalReviews >= minReviews) {
          const weightedRating =
            (totalReviews / (totalReviews + minReviews)) * avgRatingAnime +
            (minReviews / (totalReviews + minReviews)) * avgRatingAllAnime;
          return {
            title: anime.title,
            total_reviews: totalReviews,
            avg_rating: avgRatingAnime.toFixed(1), // Rata-rata rating biasa
            weighted_rating: weightedRating.toFixed(1), // Weighted Rating (WR)
          };
        }

        return null; // Tidak memenuhi syarat
      })
      .filter((anime) => anime !== null) // Hapus anime yang tidak memenuhi syarat
      .sort(
        (a, b) => parseFloat(b.weighted_rating) - parseFloat(a.weighted_rating),
      ) // Urutkan anime berdasarkan WR
      .slice(0, 10); // Tampilkan 10 anime dengan WR tertinggi

    // Tampilkan hasil query
    return data;
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
      .andWhere('transaction.status = :status', { status: 'success' })
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

  async totalTransaction() {
    return { total: await this.transactionsRepository.count() };
  }

  async totalIncome() {
    const count = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.total) as total_income')
      .where('transaction.status = :status', { status: 'success' })
      .getRawOne();

    return {
      total: parseInt(count.total_income),
    };
  }
}
