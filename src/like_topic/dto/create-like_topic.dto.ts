import { IsNumber, IsString, isString } from 'class-validator';

export class CreateLikeTopicDto {
  @IsString()
  id_topic: string;
}
