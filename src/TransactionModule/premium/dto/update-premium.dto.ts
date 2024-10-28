import { PartialType } from '@nestjs/mapped-types';
import { CreatePremiumDto } from './create-premium.dto';

export class UpdatePremiumDto extends PartialType(CreatePremiumDto) {}
