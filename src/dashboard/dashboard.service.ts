import { Injectable } from '@nestjs/common';
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
    // Langkah 1: Hitung rata-rata rating dari semua anime (C)
    const allAnimes = await this.animeRepository.find({
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

    // Langkah 2: Tentukan jumlah minimum review (m)
    const minReviews = 1; // Misalnya hanya anime dengan setidaknya 50 review yang masuk peringkat

    // Langkah 3: Hitung Weighted Rating (WR) untuk setiap anime
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

        // Hanya hitung weighted rating untuk anime dengan jumlah review >= m
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
      ); // Urutkan berdasarkan WR

    // Langkah 4: Tampilkan anime dengan WR tertinggi sebagai "Anime All Time"
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
      .getRawOne();

    return {
      total: parseInt(count.total_income),
    };
  }
}
