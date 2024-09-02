import { IsNumber, IsString } from "class-validator";

export class CreateReviewDto {
    @IsString()
    id_anime: string;

    @IsString()
    review: string;

    @IsNumber()
    rating: number;
}
