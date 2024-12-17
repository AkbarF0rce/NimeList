import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class MidtransNotificationDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  transaction_status: string;

  @IsNotEmpty()
  @IsString()
  fraud_status: string;

  @IsNotEmpty()
  gross_amount: string;

  @IsNotEmpty()
  @IsString()
  signature_key: string;

  @IsString()
  @IsOptional()
  issuer: string;

  @IsNotEmpty()
  @IsString()
  status_code: string;

  @IsNotEmpty()
  @IsString()
  payment_type: string;

  @IsOptional()
  metadata?: {
    user_id: string;
    premium_id: string;
  };

  @IsOptional()
  va_numbers?: {
    bank: string;
    va_number: string;
  }[];
}
