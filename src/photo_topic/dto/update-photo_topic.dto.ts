import { PartialType } from '@nestjs/mapped-types';
import { CreatePhotoTopicDto } from './create-photo_topic.dto';

export class UpdatePhotoTopicDto extends PartialType(CreatePhotoTopicDto) {}
