import { IsNotEmpty } from 'class-validator';
import { status } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNotEmpty()
  id_user: string;

  @IsNotEmpty()
  id_premium: string;

  @IsNotEmpty()
  payment_platform: string;

  @IsNotEmpty()
  order_id: string;

  @IsNotEmpty()
  total: number;

  token_midtrans?: string;
}
