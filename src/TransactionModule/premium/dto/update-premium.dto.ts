import { PartialType } from '@nestjs/mapped-types';
import { CreatePremiumDto } from './create-premium.dto';
import { status_premium } from '../entities/premium.entity';

export class UpdatePremiumDto extends PartialType(CreatePremiumDto) {
  name?: string;
  duration?: number;
  price?: number;
  status?: status_premium;
}
