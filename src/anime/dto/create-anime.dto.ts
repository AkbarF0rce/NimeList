import { IsNotEmpty } from 'class-validator';

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
  episodes: number;

  @IsNotEmpty()
  trailer_link: string;

  @IsNotEmpty()
  type: Types;

  // File foto akan dikelola melalui file interceptor di controller
}
