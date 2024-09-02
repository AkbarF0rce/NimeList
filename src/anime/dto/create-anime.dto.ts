import {
  IsString,
  IsInt,
  IsArray,
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from '../entities/anime.entity';

export class CreateAnimeDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  synopsis: string;

  @IsNotEmpty()
  release_date: string;

  @IsNotEmpty()
  genres: [];

  @IsNotEmpty()
  trailer_link: string;

  @IsNotEmpty()
  type: Types;

  // File foto akan dikelola melalui file interceptor di controller
}
