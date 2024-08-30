import { IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNumber()
  id_topic: number;

  @IsString()
  comment: string;
}
