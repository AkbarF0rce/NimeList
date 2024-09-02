import { IsString, IsInt, IsArray, ArrayMinSize, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from '../entities/anime.entity';

export class CreateAnimeDto {
  @IsString()
  title: string;

  @IsString()
  synopsis: string;

  @IsString()
  release_date: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => String)
  genres: string[];

  @IsString()
  trailer_link: string;

  @IsEnum(Types)
  type: Types;

  // File foto akan dikelola melalui file interceptor di controller
}
