import { IsNumber, IsString } from "class-validator";

export class CreateFavoriteAnimeDto {
    @IsString()
    id_anime: string
}
