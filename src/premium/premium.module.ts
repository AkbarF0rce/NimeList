import { Module } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Premium } from './entities/premium.entity';

@Module({
  controllers: [PremiumController],
  providers: [PremiumService],
  imports: [TypeOrmModule.forFeature([Premium])],
  exports: [PremiumService],
})
export class PremiumModule {}
