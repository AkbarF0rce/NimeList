import { Injectable } from '@nestjs/common';
import { PhotoProfile } from './entities/photo_profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';

@Injectable()
export class PhotoProfileService {
  constructor(
    @InjectRepository(PhotoProfile)
    private photoProfileRepository: Repository<PhotoProfile>,
  ) {}

  async create(id_user: string, photo: Express.Multer.File) {
    const find = await this.photoProfileRepository.findOne({
      where: { id_user: id_user },
    });

    if (find === null) {
      const create = this.photoProfileRepository.create({
        id_user: id_user,
        path_photo: photo.path,
      });

      await this.photoProfileRepository.save(create);
    }

    await this.updatePhotoIfExist(id_user, photo.path, find.path_photo);
  }

  async updatePhotoIfExist(
    id_user: string,
    photoNew: string,
    photoOld?: string,
  ) {
    try {
      await unlink(photoOld);
      await this.photoProfileRepository.update(
        { id_user: id_user },
        {
          path_photo: photoNew,
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getPhoto(id: string) {
    const get = await this.photoProfileRepository.findOne({
      where: { id_user: id },
      select: ['path_photo'],
    });

    if (!get) {
      return null;
    }

    return get.path_photo.replace(/\\/g, '/');
  }
}
