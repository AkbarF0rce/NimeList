import { PartialType } from '@nestjs/mapped-types';
import { CreateDislikeTopicDto } from './create-dislike_topic.dto';

export class UpdateDislikeTopicDto extends PartialType(CreateDislikeTopicDto) {}
