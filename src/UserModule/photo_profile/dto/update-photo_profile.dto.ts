import { PartialType } from '@nestjs/mapped-types';
import { CreatePhotoProfileDto } from './create-photo_profile.dto';

export class UpdatePhotoProfileDto extends PartialType(CreatePhotoProfileDto) {}
