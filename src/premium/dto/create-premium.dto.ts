import { IsNotEmpty, isNotEmpty } from 'class-validator';
import { badges } from 'src/user/entities/user.entity';

export class CreatePremiumDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  duration: number;

  @IsNotEmpty()
  badge: badges;
}
