import { IsNumber, IsString } from "class-validator";

export class CreateReviewDto {
    @IsNumber()
    id_anime: number;

    @IsString()
    review: string;

    @IsNumber()
    rating: number;
}
