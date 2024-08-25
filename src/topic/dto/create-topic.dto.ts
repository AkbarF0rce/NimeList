import { IsNumber, IsString } from "class-validator";

export class CreateTopicDto {
    @IsString()
    title: string

    @IsString()
    body: string

    @IsNumber()
    id_anime: number
}
