import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, Repository } from 'typeorm';
import { Anime } from './entities/anime.entity';
import { Genre } from 'src/AnimeModule/genre/entities/genre.entity';
import { PhotoAnime } from 'src/AnimeModule/photo_anime/entities/photo_anime.entity';
import { CreateAnimeDto } from './dto/create-anime.dto';
import { In } from 'typeorm';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { FavoriteAnime } from 'src/AnimeModule/favorite_anime/entities/favorite_anime.entity';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import * as fs from 'fs';
import * as crypto from 'crypto';
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
    const { title, genres } = createAnimeDto;

    // Cari genre berdasarkan ID
    const genreEntities = await this.genreRepository.find({
      where: {
        id: In(Array.isArray(genres) ? genres : [genres]),
      },
    });

    const anime = this.animeRepository.create({
      ...createAnimeDto,
      photo_cover: photo_cover.path,
      genres: genreEntities,
      slug: slugify(title, { lower: true, strict: true }),
    });

    const save = await this.animeRepository.save(anime);

    if (!save) {
      if (files && files.length > 0) {
        for (const file of files) {
          fs.unlinkSync(file.path);
        }
      }
      fs.unlinkSync(photo_cover?.path);
      throw new BadRequestException('data not created');
    }

    // Simpan photo jika ada dan save data anime berhasil
    if (save && files && files.length > 0) {
      for (const file of files) {
        const photo = this.photoRepository.create({
          file_path: file.path,
          anime,
        });
        await this.photoRepository.save(photo);
      }
    }

    throw new HttpException('data created', 201);
  }

  // Fungsi untuk Menghitung hash SHA-256 dari isi file
  private calculateFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return '';

    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    return hashSum.digest('hex');
  }

  // Fungsi untuk Mengupdate Anime
  async updateAnime(
    animeId: string,
    updateAnimeDto: UpdateAnimeDto,
    genres: [],
    photo_anime: Express.Multer.File[],
    photo_cover: Express.Multer.File,
    existing_photos: string[],
  ) {
    // Cari anime berdasarkan ID
    const anime = await this.animeRepository.findOne({
      where: { id: animeId },
      relations: ['genres', 'photos'],
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

    // Update informasi dasar anime
    Object.assign(anime, updateAnimeDto);

    if (photo_cover) {
      const fileHash = this.calculateFileHash(photo_cover.path);
      const existingHash = this.calculateFileHash(anime.photo_cover);

      if (existingHash !== fileHash) {
        // Hapus file cover lama di sistem
        const Path = join(process.cwd(), anime.photo_cover);
        try {
          await unlink(Path);
        } catch (err) {
          throw new InternalServerErrorException(
            'Error hapus data file foto cover',
          );
        }

        // Ubah path cover dengan path yang baru
        anime.photo_cover = photo_cover.path;
      }

      // Hapus file baru yang tidak diperlukan
      fs.unlinkSync(photo_cover.path);
    }

    // Jika ada genre yang diberikan
    if (genres.length > 0) {
      const genreEntities = await this.genreRepository.find({
        where: { id: In(genres) },
      });

      if (genreEntities.length !== genres.length) {
        throw new NotFoundException('Satu atau lebih genre tidak ditemukan');
      }

      anime.genres = genreEntities;
    }

    // Save anime
    const save = await this.animeRepository.save(anime);

    if (!save) {
      throw new BadRequestException('data not updated');
    }

    // Hapus data foto lama
    for (const photo of anime.photos) {
      const oldFilePath = join(process.cwd(), photo.file_path);

      // Cek apakah existing_photos memberikan path yang tidak ada di dalam sistem
      if (!existing_photos.includes(photo.file_path)) {
        try {
          await unlink(oldFilePath);
        } catch (err) {
          throw new InternalServerErrorException(
            'Error hapus data file foto anime',
          );
        }

        // Hapus foto dari database
        await this.photoRepository.delete(photo.id);
      }
    }

    if (photo_anime && photo_anime.length > 0) {
      // Simpan path dan file foto baru yang belum ada di database
      photo_anime
        .filter((file) => !existing_photos.includes(file.path)) // Hanya simpan file dan path baru yang belum ada di database
        .map(async (file) => {
          const photo = this.photoRepository.create({
            file_path: file.path,
            id_anime: anime.id,
          });
          await this.photoRepository.save(photo);
        });
    }

    throw new HttpException('data updated', 200);
  }

  // Fungsi untuk Mendapatkan Anime berdasarkan slug
  async getAnimeBySlug(slug: string) {
    // Cari anime berdasarkan id
    const anime = await this.animeRepository.findOne({
      where: { slug: slug },
      relations: ['photos'],
    });

    anime.photo_cover = anime.photo_cover.replace(/\\/g, '/');
    anime.photos = anime.photos.map((photo) =>
      photo.file_path.replace(/\\/g, '/'),
    ) as [];

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
      avgRating: getAvgRating,
      topic,
      totalFav,
    };
  }

  // Fungsi untuk Menghapus Anime
  async deleteAnime(animeId: string) {
    // Hapus anime dari database berdasarkan id yang diberikan
    const deleted = await this.animeRepository.softDelete({ id: animeId });
    const photoDeleted = await this.photoRepository.softDelete({
      id_anime: animeId,
    });

    // Tampilkan pesan jika data berhasil dihapus
    if (!deleted && !photoDeleted) {
      throw new BadRequestException('data not deleted');
    }

    throw new HttpException('data deleted', 200);
  }

  // Fungsi untuk Mendapatkan semua Anime untuk admin dengan pagination
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

  // Fungsi untuk Mendapatkan Anime Terbaru
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

  // Fungsi untuk Mendapatkan Anime Berdasarkan Genre
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
      .where('genre.name = :name', { name }) // Menyaring anime berdasarkan nama genre
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

  // Fungsi untuk Mendapatkan Anime Rekomendasi
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

  // Fungsi untuk Mendapatkan Anime Populer dengan sistem weighted rating
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
}
