import { Injectable } from '@nestjs/common';
import { CreatePhotoTopicDto } from './dto/create-photo_topic.dto';
import { UpdatePhotoTopicDto } from './dto/update-photo_topic.dto';

@Injectable()
export class PhotoTopicService {
  create(createPhotoTopicDto: CreatePhotoTopicDto) {
    return 'This action adds a new photoTopic';
  }

  findAll() {
    return `This action returns all photoTopic`;
  }

  findOne(id: number) {
    return `This action returns a #${id} photoTopic`;
  }

  update(id: number, updatePhotoTopicDto: UpdatePhotoTopicDto) {
    return `This action updates a #${id} photoTopic`;
  }

  remove(id: number) {
    return `This action removes a #${id} photoTopic`;
  }
}
