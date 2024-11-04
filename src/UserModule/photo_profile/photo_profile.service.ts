import { Injectable } from '@nestjs/common';
import { CreatePhotoProfileDto } from './dto/create-photo_profile.dto';
import { UpdatePhotoProfileDto } from './dto/update-photo_profile.dto';
import { PhotoProfile } from './entities/photo_profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PhotoProfileService {
  constructor(
    @InjectRepository(PhotoProfile)
    private photoProfileRepository: Repository<PhotoProfile>,
  ) {}
  async create(id_user: string, photo: Express.Multer.File) {
    const create = this.photoProfileRepository.create({
      id_user: id_user,
      path_photo: photo.path,
    });
    return await this.photoProfileRepository.save(create);
  }

  async getPhotoAdmin(id: string) {
    const get = await this.photoProfileRepository.findOne({
      where: { id_user: id },
    });

    return get;
  }

  findOne(id: number) {
    return `This action returns a #${id} photoProfile`;
  }

  update(id: number, updatePhotoProfileDto: UpdatePhotoProfileDto) {
    return `This action updates a #${id} photoProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} photoProfile`;
  }
}
