import { IsNumber, IsString } from "class-validator";

export class UpdateReviewDto {
    @IsString()
    ulasan: string;

    @IsNumber()
    rating: number;
}