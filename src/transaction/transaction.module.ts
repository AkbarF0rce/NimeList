// src/midtrans/midtrans.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionService } from './transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { TransactionController } from './transaction.controller';
import { UserModule } from 'src/user/user.module';
import { PremiumModule } from 'src/premium/premium.module';
import { Premium } from 'src/premium/entities/premium.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Transaction, Premium]),
    UserModule,
    PremiumModule,
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
