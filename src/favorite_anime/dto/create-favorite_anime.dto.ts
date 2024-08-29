import { IsNumber } from "class-validator";

export class CreateFavoriteAnimeDto {
    @IsNumber()
    id_anime: number
}
