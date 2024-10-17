import { Module } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Premium } from './entities/premium.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [PremiumController],
  providers: [PremiumService],
  imports: [TypeOrmModule.forFeature([Premium, User]), UserModule],
  exports: [PremiumService],
})
export class PremiumModule {}
