import { Module } from '@nestjs/common';
import { PhotoProfileService } from './photo_profile.service';
import { PhotoProfileController } from './photo_profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoProfile } from './entities/photo_profile.entity';

@Module({
  controllers: [PhotoProfileController],
  providers: [PhotoProfileService],
  imports: [TypeOrmModule.forFeature([PhotoProfile])],
})
export class PhotoProfileModule {}
