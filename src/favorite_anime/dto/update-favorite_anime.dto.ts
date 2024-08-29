import { PartialType } from '@nestjs/mapped-types';
import { CreateFavoriteAnimeDto } from './create-favorite_anime.dto';

export class UpdateFavoriteAnimeDto extends PartialType(CreateFavoriteAnimeDto) {}
