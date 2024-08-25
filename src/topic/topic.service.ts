import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { Repository } from 'typeorm';
import { PhotoTopic } from 'src/photo_topic/entities/photo_topic.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic) private topicRepository: Repository<Topic>,
    @InjectRepository(PhotoTopic) private photoTopicRepository: Repository<PhotoTopic>,
  ) {}

  async create(
    createTopicDto: CreateTopicDto,
    photos: Express.Multer.File[],
  ) {
    // Create data topic
    const topic = this.topicRepository.create(createTopicDto);
    await this.topicRepository.save(topic);

    // Save photos if available
    if (photos && photos.length > 0) {
      for (const file of photos) {
        const photo = this.photoTopicRepository.create({
          file_path: file.path,
          topic
        });
        await this.photoTopicRepository.save(photo);
      }
    }

    return {
      topic: topic,
      photos
    }
  }
}
