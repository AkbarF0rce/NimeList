import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, Repository } from 'typeorm';
import { Anime } from './entities/anime.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { PhotoAnime } from 'src/photo_anime/entities/photo_anime.entity';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { In } from 'typeorm';
import path, { join } from 'path';
import { unlink } from 'fs/promises';
import { Topic } from 'src/topic/entities/topic.entity';
import { v4 } from 'uuid';
import { FavoriteAnime } from 'src/favorite_anime/entities/favorite_anime.entity';
import { Review } from 'src/review/entities/review.entity';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { min } from 'class-validator';

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
    @InjectRepository(PhotoAnime)
    private photoRepository: Repository<PhotoAnime>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(FavoriteAnime)
    private favoriteAnimeRepository: Repository<FavoriteAnime>,
  ) {}

  async createAnime(
    createAnimeDto: CreateAnimeDto,
    files: Express.Multer.File[],
    photo_cover: Express.Multer.File,
  ) {
    const {
      title,
      synopsis,
      release_date,
      genres,
      trailer_link,
      type,
      episodes,
      watch_link,
    } = createAnimeDto;

    // Cari genre berdasarkan ID
    const genreEntities = await this.genreRepository.find({
      where: {
        id: In(genres),
      },
    });

    const anime = this.animeRepository.create({
      title,
      synopsis,
      release_date,
      trailer_link,
      episodes,
      type,
      watch_link,
      photo_cover: photo_cover.path,
      genres: genreEntities,
    });
    await this.animeRepository.save(anime);

    // Save photos if available
    if (files && files.length > 0) {
      for (const file of files) {
        const photo = this.photoRepository.create({
          file_path: file.path, // Adjust if using a different storage strategy
          anime,
        });
        await this.photoRepository.save(photo);
      }
    }

    return {
      status: 201,
      message: 'data created',
    };
  }

  // Fungsi untuk Menghitung hash SHA-256 dari isi file
  private calculateFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return '';

    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    return hashSum.digest('hex');
  }

  async updateAnime(
    animeId: string,
    updateAnimeDto: UpdateAnimeDto, // Data anime yang ingin diupdate
    genres: [], // ID genre baru yang ingin dihubungkan dengan anime ini
    photo_anime: Express.Multer.File[],
    photo_cover: Express.Multer.File, // File cover baru yang di-upload
    existing_photos: string[],
  ) {
    // Cari anime berdasarkan ID
    const anime = await this.animeRepository.findOne({
      where: { id: animeId },
      relations: ['genres', 'photos'], // Ambil relasi genre dan photo saat ini
    });

    if (!anime) {
      throw new NotFoundException('Anime tidak ditemukan');
    }

    if (photo_cover) {
      const fileHash = this.calculateFileHash(photo_cover.path);
      const existingHash = this.calculateFileHash(anime.photo_cover);

      if (existingHash !== fileHash) {
        // Hapus file cover lama di sistem
        const Path = join(process.cwd(), anime.photo_cover);
        try {
          await unlink(Path); // Hapus file cover lama dari sistem
        } catch (err) {
          console.error('Error hapus data file foto: ', err);
        }

        // Ubah path cover dengan path yang baru
        anime.photo_cover = photo_cover.path;
        console.log(photo_cover.path);
      } else {
        fs.unlinkSync(photo_cover.path);
      }
    }

    // Update informasi dasar anime
    Object.assign(anime, updateAnimeDto);

    const genreEntities = await this.genreRepository.find({
      where: { id: In(genres) },
    });

    if (genreEntities.length !== genres.length) {
      throw new NotFoundException('Satu atau lebih genre tidak ditemukan');
    }

    // Update genre
    anime.genres = genreEntities;
    // Save anime
    const save = await this.animeRepository.save(anime);

    if (save) {
      // Identifikasi dan hapus foto lama yang tidak ada di file baru
      for (const photo of anime.photos) {
        const oldFilePath = join(process.cwd(), photo.file_path);

        // Cek apakah existing_photos memberikan path yang tidak ada di dalam sistem
        if (!existing_photos.includes(photo.file_path)) {
          try {
            await unlink(oldFilePath); // Hapus file lama dari sistem
          } catch (err) {
            console.error('Error deleting old photo file:', err);
          }
          await this.photoRepository.remove(photo); // Hapus data foto lama dari database
        }
      }

      if (photo_anime && photo_anime.length > 0) {
        // Simpan path dan file foto baru yang belum ada di database
        const newPhotos = photo_anime
          .filter((file) => !existing_photos.includes(file.path)) // Hanya simpan file dan path baru yang belum ada di database
          .map(async (file) => {
            const photo = this.photoRepository.create({
              file_path: file.path,
              anime,
            });
            await this.photoRepository.save(photo);
          });
      }
    }
  }

  async getAnimeById(animeId: string) {
    // Cari anime berdasarkan id
    const anime = await this.animeRepository.findOne({
      where: { id: animeId },
      relations: ['genres', 'photos', 'review', 'topic'],
    });

    if (!anime) {
      throw new NotFoundException('Anime tidak ditemukan');
    }

    // Hitung total review dari id anime
    const reviewCount = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.id_anime = :animeId', { animeId })
      .getCount();

    // Hitung average rating dari id anime
    const getAvgRating = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.id_anime = :animeId', { animeId })
      .select('AVG(review.rating)', 'ratingAvg')
      .getRawOne();

    // Format rata-rata rating dengan dua angka di belakang koma
    const avgRating = parseFloat(getAvgRating.ratingAvg).toFixed(1);

    // Hitung total topic dari id anime
    const topicCount = await this.topicRepository
      .createQueryBuilder('topic')
      .where('topic.id_anime = :animeId', { animeId })
      .getCount();

    const totalFav = await this.favoriteAnimeRepository
      .createQueryBuilder('fav')
      .where('fav.id_anime = :animeId', { animeId })
      .getCount();

    return {
      anime,
      reviewCount,
      averageRating: parseFloat(avgRating) || 0, // Set 0 jika tidak ada rating
      topicCount,
      totalFav,
    };
  }

  async deleteAnime(animeId: string) {
    // Hapus anime dari database berdasarkan id yang diberikan
    const deleted = await this.animeRepository.softDelete({ id: animeId });
    const photoDeleted = await this.photoRepository.softDelete({
      id_anime: animeId,
    });
  }

  async getAllAnimeAdmin(
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ) {
    // Ambil semua data anime dan relasi review
    const [animes, total] = await this.animeRepository.findAndCount({
      relations: ['review'],
      where: {
        title: ILike(`%${search}%`),
      },
      order: {
        release_date: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Hitung rata-rata rating untuk setiap anime
    const data = animes.map((anime) => {
      // Menghitung rata-rata rating jika anime memiliki review
      const avgRating =
        anime.review.length > 0
          ? anime.review.reduce(
              (total, review) => total + Number(review.rating),
              0,
            ) / anime.review.length
          : 0;

      return {
        id: anime.id,
        title: anime.title,
        created_at: anime.created_at,
        release_date: anime.release_date,
        updated_at: anime.updated_at,
        avg_rating: avgRating.toFixed(1), // Format ke 1 desimal
      };
    });

    return {
      data,
      total,
    };
  }

  async getAnimeNewest() {
    const animes = await this.animeRepository.find({
      order: { release_date: 'DESC' },
      relations: ['genres'],
      take: 10,
      select: [
        'id',
        'title',
        'type',
        'photo_cover',
        'release_date',
        'synopsis',
        'trailer_link',
      ],
    });

    return { data: animes };
  }

  async getAnimeByGenre(genreId: number) {
    const animes = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoin('anime.review', 'review') // Join table review
      .leftJoin('anime.genres', 'genre') // Join table genre
      .addSelect('COALESCE(AVG(review.rating), 0)', 'averageRating')
      .where('genre.id = :genreId', { genreId }) // Menyaring anime berdasarkan id genre
      .groupBy('anime.id')
      .getRawMany();

    // Jika tidak ada anime yang mengandung genre yang dipilih
    if (animes.length === 0) {
      throw new NotFoundException(
        'Anime yang mengandung genre ini tidak ditemukan',
      );
    }

    // Tampilkan anime yang ada
    return animes.map((anime) => ({
      ...anime,
      averageRating: parseFloat(anime.averageRating).toFixed(1),
    }));
  }

  async getRecommended() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();

    // Tentukan periode berdasarkan bulan saat ini
    let startDate: Date;
    let endDate: Date;

    if (currentDate.getMonth() < 6) {
      // Periode Januari - Juni
      startDate = new Date(year, 0, 1); // 1 Januari
      endDate = new Date(year, 5, 30, 23, 59, 59); // 30 Juni
    } else {
      // Periode Juli - Desember
      startDate = new Date(year, 6, 1); // 1 Juli
      endDate = new Date(year, 11, 31, 23, 59, 59); // 31 Desember
    }

    const recommendedAnimes = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoin('anime.review', 'review')
      .select([
        'anime.id',
        'anime.title',
        'anime.photo_cover',
        'anime.type',
        'AVG(review.rating) AS avg_rating',
        'COUNT(review.id) AS review_count',
      ])
      .groupBy('anime.id')
      .where('review.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('avg_rating', 'DESC') // Urutkan berdasarkan rating
      .limit(10) // Batasi ke 10 anime teratas
      .getRawMany();

    return recommendedAnimes.map((anime) => ({
      ...anime,
      avg_rating: parseFloat(anime.avg_rating).toFixed(1),
    }));
  }

  async getMostPopular() {
    // Hitung rata-rata rating dari semua anime (C)
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

    // Tentukan jumlah minimum review (m)
    const minReviews = 1; // Misalnya hanya anime dengan setidaknya 50 review yang masuk peringkat

    // Hitung Weighted Rating (WR) untuk setiap anime
    const data = allAnimes
      .map((anime) => {
        const totalReviewAllAnime = anime.review.length;
        const avgRatingAnime =
          totalReviewAllAnime > 0
            ? anime.review.reduce(
                (total, review) => total + Number(review.rating),
                0,
              ) / totalReviewAllAnime
            : 0;

        // Hanya hitung weighted rating untuk anime dengan jumlah review >= m
        if (totalReviewAllAnime >= minReviews) {
          const weightedRating =
            (totalReviewAllAnime / (totalReviewAllAnime + minReviews)) *
              avgRatingAnime +
            (minReviews / (totalReviewAllAnime + minReviews)) *
              avgRatingAllAnime;
          return {
            id: anime.id,
            title: anime.title,
            type: anime.type,
            photo_cover: anime.photo_cover,
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

    // Tampilkan anime dengan WR tertinggi sebagai "Anime All Time"
    return data;
  }

  async getAllGenre() {
    return await this.genreRepository.find();
  }
}
