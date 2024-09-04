import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTopicDto {
    @IsNotEmpty()
    title: string

    @IsNotEmpty()
    body: string

    @IsNotEmpty()
    id_anime: string

    @IsNotEmpty()
    id_user: string
}
