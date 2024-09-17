import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhotoAnimeDto } from './dto/create-photo_anime.dto';
import { UpdatePhotoAnimeDto } from './dto/update-photo_anime.dto';
import { join } from 'path';
import { PhotoAnime } from './entities/photo_anime.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class PhotoAnimeService {
  constructor(
    @InjectRepository(PhotoAnime)
    private photoRepository: Repository<PhotoAnime>,
  ) {}
  async deletePhoto(id: string) {
    const findPhoto = await this.photoRepository.findOne({ where: { id } });

    // Hapus file foto dari directori sistem
    const Path = join(process.cwd(), findPhoto.file_path);
    try {
      await unlink(Path);
    } catch (err) {
      console.error('Error hapus data file foto: ', err);
    }

    // Hapus entry photo dari database
    await this.photoRepository.softDelete(id);

    // Tampilkan pesan jika berhasil di hapus
    return 'data dan file foto berhasil dihapus';
  }

  // Fungsi untuk Menghitung hash SHA-256 dari isi file
  private calculateFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return '';

    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    return hashSum.digest('hex');
  }

  async updatePhoto(id: string, files: Express.Multer.File) {
    // Cari foto spesifik berdasarkan ID-nya
    const photos = await this.photoRepository.findOne({
      where: { id },
    });

    if (!photos) {
      throw new NotFoundException('Foto tidak ditemukan');
    }

    if (files) {
      const fileHash = this.calculateFileHash(files.path);
      const existingHash = this.calculateFileHash(photos.file_path);

      if (existingHash !== fileHash) {
        // Hapus file cover lama di sistem
        const Path = join(process.cwd(), photos.file_path);
        try {
          await unlink(Path); // Hapus file cover lama dari sistem
        } catch (err) {
          console.error('Error hapus data file foto: ', err);
        }

        // Ubah path cover dengan path yang baru
        photos.file_path = files.path;

        // Simpan file path foto yang baru
        await this.photoRepository.save(photos);

        return {
          message: 'Foto berhasil diperbarui',
          filePhoto: photos,
        };
      } else {
        fs.unlinkSync(files.path);
        return {
          message: 'foto tidak ada yang baru',
        };
      }
    }
  }

  async getAllPhoto() {
    const photos = await this.photoRepository
      .createQueryBuilder('photo')
      .leftJoin('photo.anime', 'anime')
      .select([
        'photo.id',
        'photo.file_path',
        'anime.title',
        'photo.created_at',
        'photo.updated_at',
      ])
      .getMany();

    return photos.map((photo) => ({
      id: photo.id,
      file_path: photo.file_path,
      anime: photo.anime.title,
      created_at: photo.created_at,
      updated_at: photo.updated_at,
    }));
  }
}
