import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhotoAnimeDto } from './dto/create-photo_anime.dto';
import { UpdatePhotoAnimeDto } from './dto/update-photo_anime.dto';
import { join } from 'path';
import { PhotoAnime } from './entities/photo_anime.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';

@Injectable()
export class PhotoAnimeService {
  constructor(@InjectRepository(PhotoAnime) private photoRepository: Repository<PhotoAnime>){}
  async deletePhoto(id: number) {
    const findPhoto = await this.photoRepository.findOne({where : {id}});

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
    return 'data dan file foto berhasil dihapus'
  }

  async updatePhoto(id: number, files: Express.Multer.File[]) {
    
    // Cari foto spesifik berdasarkan ID-nya
    const photos = await this.photoRepository.findOne({
      where: { id }
    });

    if (!photos) {
      throw new NotFoundException('Foto tidak ditemukan');
    }

    // Buat set untuk menyimpan path file yang baru diupload
    const newFilePaths = new Set(files.map(file => file.path));

    // Jika file path lama tidak ada di file path yang baru, maka hapus
    if(!newFilePaths.has(photos.file_path)) {
      // Hapus file foto lama dari sistem
      const Path = join(process.cwd(), photos.file_path);
      try {
        await unlink(Path);
      } catch (err) {
        console.error('Error hapus data file foto: ', err);
      }      
    }
    else {
      return {
        message: 'File foto tidak ada yang baru',
      };
    }

    // Update path file di database
    photos.file_path = files[0].path;
    this.photoRepository.save(photos);

    return {
      message: 'Foto berhasil diperbarui',
      filePhoto: photos,
    };
  }
}
