import { PartialType } from '@nestjs/mapped-types';
import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';
import { CreateAnimeDto } from './create-anime.dto';
import { Type } from 'class-transformer';
import { Types } from '../entities/anime.entity';

export class UpdateAnimeDto extends PartialType(CreateAnimeDto) {
  title?: string;
  synopsis?: string;
  release_date?: string;
  trailer_link?: string;
  type?: Types;
  watch_link?: string;
  episodes?: number;
  slug?: string;
}
