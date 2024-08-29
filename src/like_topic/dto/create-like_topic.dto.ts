import { IsNumber, IsString, isString } from 'class-validator';

export class CreateLikeTopicDto {
  @IsNumber()
  id_topic: number;
}
