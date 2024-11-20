import { Injectable } from '@nestjs/common';
import { CreatePhotoProfileDto } from './dto/create-photo_profile.dto';
import { UpdatePhotoProfileDto } from './dto/update-photo_profile.dto';
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

    if (find) {
      this.updatePhotoIfExist(id_user, photo.path, find.path_photo);
    }
    const create = this.photoProfileRepository.create({
      id_user: id_user,
      path_photo: photo.path,
    });
    return await this.photoProfileRepository.save(create);
  }

  async updatePhotoIfExist(
    id_user: string,
    photoNew: string,
    photoOld?: string,
  ) {
    try {
      await this.photoProfileRepository.delete({ id_user: id_user });
      await unlink(photoOld);
      await this.photoProfileRepository.update(id_user, {
        path_photo: photoNew,
      });
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

    return get.path_photo;
  }
}
