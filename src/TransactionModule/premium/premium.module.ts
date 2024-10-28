import { Module } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Premium } from './entities/premium.entity';
import { User } from 'src/AuthModule/user/entities/user.entity';
import { UserModule } from 'src/AuthModule/user/user.module';

@Module({
  controllers: [PremiumController],
  providers: [PremiumService],
  imports: [TypeOrmModule.forFeature([Premium, User]), UserModule],
  exports: [PremiumService],
})
export class PremiumModule {}
