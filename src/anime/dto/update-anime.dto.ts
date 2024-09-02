import { PartialType } from '@nestjs/mapped-types';
import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';
import { CreateAnimeDto } from './create-anime.dto';
import { Type } from 'class-transformer';
import { Types } from '../entities/anime.entity';

export class UpdateAnimeDto extends PartialType(CreateAnimeDto) {
  title?: string;
  synopsis?: string;
  release_date?: string;
  genres?: [];
  trailer_link?: string;
  type?: Types;
}
