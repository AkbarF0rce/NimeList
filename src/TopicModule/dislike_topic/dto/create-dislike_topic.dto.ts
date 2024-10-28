import { IsNotEmpty } from 'class-validator';

export class CreateDislikeTopicDto {
  @IsNotEmpty()
  id_topic: string;

  @IsNotEmpty()
  id_user: string;
}
