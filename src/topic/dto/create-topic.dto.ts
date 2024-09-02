import { IsNumber, IsString } from "class-validator";

export class CreateTopicDto {
    @IsString()
    title: string

    @IsString()
    body: string

    @IsString()
    id_anime: string
}
