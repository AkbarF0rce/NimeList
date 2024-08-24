import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimeDto } from './create-anime.dto';
import { IsString } from 'class-validator';

export class UpdatePhotoDto {
  @IsString()
  filePath: string;
}
