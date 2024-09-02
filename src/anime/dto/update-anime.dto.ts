import { PartialType } from '@nestjs/mapped-types';
import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';
import { CreateAnimeDto } from './create-anime.dto';
import { Type } from 'class-transformer';
import { Types } from '../entities/anime.entity';

export class UpdateAnimeDto extends PartialType(CreateAnimeDto) {
  @IsString()
  title?: string;

  @IsString()
  synopsis?: string;

  @IsString()
  release_date?: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => String)
  genres?: string[];

  @IsString()
  trailer_link?: string;

  @IsEnum(Types)
  type?: Types;
}
