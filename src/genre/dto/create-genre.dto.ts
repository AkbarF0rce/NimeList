import { IsString, IsInt, IsArray, ArrayMinSize, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGenreDto {
  @IsNotEmpty()
  name: string;
}