import { IsString, IsInt, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGenreDto {
  @IsString()
  name: string;
}