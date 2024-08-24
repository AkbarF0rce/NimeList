import { PartialType } from '@nestjs/mapped-types';
import { CreatePhotoAnimeDto } from './create-photo_anime.dto';

export class UpdatePhotoAnimeDto extends PartialType(CreatePhotoAnimeDto) {}
