import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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
      anime: anime,
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
    photos_anime: Express.Multer.File[], // File foto baru yang di-upload
    photo_cover: Express.Multer.File, // File cover baru yang di-upload
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
      } else {
        fs.unlinkSync(photo_cover.path);
      }
    }

    // Update informasi dasar anime
    Object.assign(anime, updateAnimeDto);

    // Update genre
    const genreEntities = await this.genreRepository.find({
      where: { id: In(genres) },
    });

    if (genreEntities.length !== genres.length) {
      throw new NotFoundException('Satu atau lebih genre tidak ditemukan');
    }

    anime.genres = genreEntities;
    await this.animeRepository.save(anime);

    // Jika ada foto yang diupload
    if (photos_anime && photos_anime.length > 0) {
      // Hash file yang baru diupload
      const newPhotoHashes = photos_anime.map((file) =>
        this.calculateFileHash(file.path),
      );

      // Identifikasi dan hapus foto lama yang tidak ada di file baru
      for (const photo of anime.photos) {
        const oldFilePath = join(process.cwd(), photo.file_path);
        const oldFileHash = this.calculateFileHash(oldFilePath);

        // Jika hash file lama tidak ditemukan dalam hash file baru, hapus file lama
        if (!newPhotoHashes.includes(oldFileHash)) {
          try {
            await unlink(oldFilePath); // Hapus file lama dari sistem
          } catch (err) {
            console.error('Error deleting old photo file:', err);
          }
          await this.photoRepository.remove(photo); // Hapus data foto lama dari database
        }
      }

      // Simpan foto baru
      for (const file of photos_anime) {
        const fileHash = this.calculateFileHash(file.path);

        // Cek apakah file ini sudah ada di dalam sistem berdasarkan hash dengan mencocokkan hash file dengan file yang sudah ada
        const isDuplicate = anime.photos.some((photo) => {
          const existingFileHash = this.calculateFileHash(
            join(process.cwd(), photo.file_path),
          );
          return existingFileHash === fileHash;
        });

        if (!isDuplicate) {
          const photo = this.photoRepository.create({
            file_path: file.path,
            anime,
          });
          await this.photoRepository.save(photo); // Simpan data foto baru
        } else {
          fs.unlinkSync(file.path);
        }
      }
    }

    return {
      message: 'Anime, genre, dan foto berhasil diperbarui',
      updatedAnime: anime,
    };
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
      avg_Rating: parseFloat(avgRating) || 0, // Set 0 jika tidak ada rating
      topicCount,
      totalFav,
    };
  }

  async deleteAnime(animeId: string) {
    // Hapus anime dari database berdasarkan id yang diberikan
    const deleted = await this.animeRepository.softDelete({ id: animeId });

    if (deleted) {
      return 'data anime berhasil dihapus';
    } else if (!deleted) {
      return 'data anime gagal di hapus';
    } else {
      throw new NotFoundException('Anime tidak ditemukan');
    }
  }

  async getAllAnime() {
    const animes = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.genres', 'genre')
      .leftJoin('anime.review', 'review')
      .select([
        'anime.id',
        'anime.title',
        'anime.created_at',
        'anime.updated_at',
        'genre.name',
      ])
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avg_rating')
      .addSelect('COUNT(review.id)', 'total_review')
      .groupBy('anime.id, genre.id')
      .getRawAndEntities();

    const transformedAnimes = animes.entities.map((anime) => ({
      ...anime,
      genres: anime.genres.map((g) => g.name),
      avg_rating: Number(
        parseFloat(
          animes.raw.find((r) => r.anime_id === anime.id)?.avg_rating || '0',
        ).toFixed(1),
      ),
      total_review: parseInt(
        animes.raw.find((r) => r.anime_id === anime.id)?.total_review || '0',
      ),
    }));

    return transformedAnimes;
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

  async getAnimeRecommended() {
    const animes = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoin('anime.review', 'review')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .groupBy('anime.id')
      .having('AVG(review.rating) > :minRating', { minRating: 4 })
      .andHaving('COUNT(review.id) > :minReviews', { minReviews: 1 })
      .getRawMany();

    if (animes.length === 0) {
      throw new NotFoundException(
        'Anime yang direkomendasikan tidak ditemukan',
      );
    }

    return animes.map((anime) => ({
      ...anime,
      avgRating: parseFloat(anime.avgRating).toFixed(1),
    }));
  }

  async getAllGenre() {
    return await this.genreRepository.find();
  }
}
