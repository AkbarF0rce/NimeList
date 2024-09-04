import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  id_topic: string;

  @IsNotEmpty()
  id_user: string

  @IsNotEmpty()
  comment: string;
}
