import { PartialType } from '@nestjs/mapped-types';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';
import { CreateAnimeDto } from './create-anime.dto';
import { Type } from 'class-transformer';

export class UpdateAnimeDto extends PartialType(CreateAnimeDto) {
  @IsString()
  title?: string;

  @IsString()
  synopsis?: string;

  @IsString()
  release_date?: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  genres?: number[];

  @IsString()
  trailer_link?: string;
}
