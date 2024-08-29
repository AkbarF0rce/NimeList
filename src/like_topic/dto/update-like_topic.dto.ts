import { PartialType } from '@nestjs/mapped-types';
import { CreateLikeTopicDto } from './create-like_topic.dto';

export class UpdateLikeTopicDto extends PartialType(CreateLikeTopicDto) {}
