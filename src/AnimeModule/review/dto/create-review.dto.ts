import { IsNotEmpty } from "class-validator";

export class CreateReviewDto {
    @IsNotEmpty()
    id_anime: string;

    @IsNotEmpty()
    id_user: string;

    @IsNotEmpty()
    review: string;

    @IsNotEmpty()
    rating: number;
}
