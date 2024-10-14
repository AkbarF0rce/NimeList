import { IsNotEmpty, isNotEmpty } from 'class-validator';

export class CreatePremiumDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  duration: number;
}
