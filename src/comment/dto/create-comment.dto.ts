import { IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  id_topic: string;

  @IsString()
  comment: string;
}
