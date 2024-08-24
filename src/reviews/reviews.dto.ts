import { IsNumber, IsString } from "class-validator";

export class CreateReviewDto {
    @IsNumber()
    id_anime: number;

    @IsString()
    ulasan: string;

    @IsNumber()
    rating: number;
}