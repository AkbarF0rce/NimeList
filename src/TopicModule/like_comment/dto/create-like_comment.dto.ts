import { IsNotEmpty } from "class-validator";

export class CreateLikeCommentDto {
    @IsNotEmpty()
    id_user: string;

    @IsNotEmpty()
    id_comment: string;
}
