import { IsNotEmpty } from "class-validator";

export class CreatePhotoProfileDto {
    @IsNotEmpty()
    id_user: string;

    @IsNotEmpty()
    path_photo: string;
}
