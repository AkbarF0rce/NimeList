import { IsNotEmpty, isNotEmpty, IsOptional } from 'class-validator';

export class CreatePremiumDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  duration: number;

  @IsOptional()
  description?: string;
}
