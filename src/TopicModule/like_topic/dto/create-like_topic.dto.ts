import { IsNotEmpty } from 'class-validator';

export class CreateLikeTopicDto {
  @IsNotEmpty()
  id_topic: string;

  @IsNotEmpty()
  id_user: string;
}
