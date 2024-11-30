import { PartialType } from '@nestjs/mapped-types';
import { CreateTopicDto } from './create-topic.dto';
import { IsNumber, IsString } from 'class-validator';

export class UpdateTopicDto {
  title?: string;
  photos?: Express.Multer.File[];
  body?: string;
  existing_photos?: string[];
  id_user?: string;
  role?: string;
  slug?: string;
}
