import { IsString, IsInt, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnimeDto {
  @IsString()
  title: string;

  @IsString()
  synopsis: string;

  @IsString()
  release_date: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  genres: number[];

  @IsString()
  trailer_link: string;

  // File foto akan dikelola melalui file interceptor di controller
}
