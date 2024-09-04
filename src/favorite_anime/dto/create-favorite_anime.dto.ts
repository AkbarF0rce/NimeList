import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateFavoriteAnimeDto {
    @IsString()
    id_anime: string

    @IsNotEmpty()
    id_user: string
}
