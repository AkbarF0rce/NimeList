import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, Repository } from 'typeorm';
import { Anime } from './entities/anime.entity';
import { Genre } from 'src/AnimeModule/genre/entities/genre.entity';
import { PhotoAnime } from 'src/AnimeModule/photo_anime/entities/photo_anime.entity';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { In } from 'typeorm';
import path, { join } from 'path';
import { unlink } from 'fs/promises';
import { Topic } from 'src/TopicModule/topic/entities/topic.entity';
import { v4 } from 'uuid';
import { FavoriteAnime } from 'src/AnimeModule/favorite_anime/entities/favorite_anime.entity';
import { Review } from 'src/AnimeModule/review/entities/review.entity';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { min } from 'class-validator';
import { ReviewService } from '../review/review.service';
import { TopicService } from 'src/TopicModule/topic/topic.service';
import { GenreService } from '../genre/genre.service';
import slugify from 'slugify';

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
    private readonly reviewService: ReviewService,
    private readonly topicService: TopicService,
    private readonly genreService: GenreService,
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
      slug,
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
      slug: slugify(title, { lower: true, strict: true }),
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
      message: 'Data created',
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

    if (anime.title !== updateAnimeDto.title) {
      updateAnimeDto.slug = slugify(updateAnimeDto.title, {
        lower: true,
        strict: true,
      });
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

    return {
      status: 200,
      message: 'Data updated',
    };
  }

  async getAnimeBySlug(slug: string) {
    // Cari anime berdasarkan id
    const anime = await this.animeRepository.findOne({
      where: { slug: slug },
      relations: ['photos'],
    });

    if (!anime) {
      throw new NotFoundException('Anime tidak ditemukan');
    }

    // Ambil jumlah dan data review yang berkaitan dengan id anime
    const review = await this.reviewService.getAndCountByAnime(anime.id);

    // Hitung average rating dari id anime
    const getAvgRating = await this.reviewService.getAvgRatingByAnime(anime.id);

    // Ambil jumlah dan data topic yang berkaitan dengan id anime
    const topic = await this.topicService.getAndCountByAnime(anime.id);

    // Ambil semua data genre yang berkaitan dengan id anime
    const genres = await this.genreService.getByAnime(anime.id);

    // Hitung jumlah favorit berdasarkan id anime
    const totalFav = await this.favoriteAnimeRepository.countBy({
      id_anime: anime.id,
    });

    return {
      anime,
      genres,
      review,
      avgRating: getAvgRating || 0, // Set 0 jika tidak ada rating
      topic,
      totalFav,
    };
  }

  async deleteAnime(animeId: string) {
    // Hapus anime dari database berdasarkan id yang diberikan
    const deleted = await this.animeRepository.softDelete({ id: animeId });
    const photoDeleted = await this.photoRepository.softDelete({
      id_anime: animeId,
    });

    // Tampilkan pesan jika data berhasil dihapus
    if (deleted && photoDeleted) {
      return {
        status: 200,
        message: 'data deleted',
      }
    }
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
          ? Number(
              parseFloat(
                (
                  anime.review.reduce(
                    (total, review) => total + Number(review.rating),
                    0,
                  ) / anime.review.length
                ).toString(),
              ).toFixed(1),
            )
          : 0;

      return {
        id: anime.id,
        title: anime.title,
        created_at: anime.created_at,
        release_date: anime.release_date,
        updated_at: anime.updated_at,
        slug: anime.slug,
        avg_rating: avgRating,
      };
    });

    return {
      data,
      animes,
      total,
    };
  }

  async getAnimeNewest(limit: number) {
    const animes = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoin('anime.review', 'review') // Join table review
      .leftJoin('anime.genres', 'genre') // Join table genre
      .addSelect('COALESCE(AVG(review.rating), 0)', 'averageRating')
      .addSelect('array_agg(distinct genre.name)', 'genres') // Aggregate genre names as an array
      .groupBy('anime.id')
      .orderBy('anime.release_date', 'DESC')
      .limit(limit)
      .getRawMany();

    const result = animes.map((anime) => ({
      id: anime.anime_id,
      synopsis: anime.anime_synopsis,
      title: anime.anime_title,
      photo_cover: anime.anime_photo_cover,
      trailer_link: anime.anime_trailer_link,
      type: anime.anime_type,
      slug: anime.anime_slug,
      avgRating: parseFloat(anime.averageRating).toFixed(1),
      genres: anime.genres,
    }));

    return { data: result };
  }

  async getAnimeByGenre(name: string) {
    const animes = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoin('anime.review', 'review') // Join table review
      .leftJoin('anime.genres', 'genre') // Join table genre
      .select([
        'anime.id',
        'anime.photo_cover',
        'anime.type',
        'anime.title',
        'anime.slug',
      ])
      .addSelect('COALESCE(AVG(review.rating), 0)', 'averageRating')
      .where('genre.name = :name', { name }) // Menyaring anime berdasarkan id genre
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
      id: anime.anime_id,
      photo_cover: anime.anime_photo_cover,
      type: anime.anime_type,
      title: anime.anime_title,
      slug: anime.anime_slug,
      avgRating: parseFloat(anime.averageRating).toFixed(1),
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
        'anime.slug',
        'AVG(review.rating) AS avg_rating',
        'COUNT(review.id) AS review_count',
      ])
      .groupBy('anime.id')
      .where('review.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('avg_rating', 'DESC') // Urutkan berdasarkan rating
      .limit(14) // Batasi ke 14 anime teratas
      .getRawMany();

    return recommendedAnimes.map((anime) => ({
      id: anime.anime_id,
      title: anime.anime_title,
      photo_cover: anime.anime_photo_cover,
      type: anime.anime_type,
      slug: anime.anime_slug,
      avgRating: parseFloat(anime.avg_rating).toFixed(1),
    }));
  }

  async getMostPopular() {
    // Mencari semua data anime dan relasi review
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

          // Ambil rating dari review terakhir (terbaru) berdasarkan tanggal createdAt
          const latestReview = anime.review.reduce((latest, review) => {
            const reviewDate = new Date(review.created_at); // Pastikan review memiliki createdAt
            return reviewDate > new Date(latest.created_at) ? review : latest;
          }, anime.review[0]); // Inisialisasi dengan review pertama

          return {
            title: anime.title,
            id: anime.id,
            photo_cover: anime.photo_cover,
            type: anime.type,
            slug: anime.slug,
            total_reviews: totalReviews,
            avgRating: avgRatingAnime.toFixed(1), // Rata-rata rating biasa
            weighted_rating: weightedRating.toFixed(1), // Weighted Rating (WR)
            latest_review_rating: Number(latestReview.rating), // Rating terakhir
          };
        }

        return null; // Tidak memenuhi syarat
      })
      .filter((anime) => anime !== null) // Hapus anime yang tidak memenuhi syarat
      .sort((a, b) => {
        // Urutkan berdasarkan WR terlebih dahulu
        const weightedDifference =
          parseFloat(b.weighted_rating) - parseFloat(a.weighted_rating);
        if (weightedDifference !== 0) return weightedDifference;

        // Jika WR sama, urutkan berdasarkan jumlah review (total_reviews) secara menurun
        const reviewDifference = b.total_reviews - a.total_reviews;
        if (reviewDifference !== 0) return reviewDifference;

        // Jika jumlah review juga sama, urutkan berdasarkan avg_rating secara menurun
        const avgRatingDifference =
          parseFloat(b.avgRating) - parseFloat(a.avgRating);
        if (avgRatingDifference !== 0) return avgRatingDifference;

        // Jika avg_rating juga sama, urutkan berdasarkan tanggal review terakhir (latest_review_date) secara menurun
        return b.latest_review_rating - a.latest_review_rating;
      })
      .slice(0, 10); // Tampilkan 10 anime dengan WR tertinggi

    // Tampilkan hasil query
    return data;
  }

  async getAllGenre() {
    return await this.genreRepository.find();
  }
}
