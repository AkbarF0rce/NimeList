// src/midtrans/midtrans.service.ts

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as midtransClient from 'midtrans-client';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PremiumService } from 'src/premium/premium.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  private snap: midtransClient.Snap;
  private serverKey: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private usersService: UserService,
    private premiumService: PremiumService,
  ) {
    this.serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    this.snap = new midtransClient.Snap({
      isProduction: false, // Ubah menjadi true di produksi
      serverKey: this.configService.get<string>('MIDTRANS_SERVER_KEY'),
      clientKey: this.configService.get<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  async handleTransaction(orderData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.snap
        .createTransaction(orderData)
        .then((transaction) => {
          resolve(transaction.token);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async createTransaction(
    userId: string,
    membershipId: string,
  ): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const membership = await this.premiumService.findById(membershipId);
    if (!membership) {
      throw new HttpException('Membership not found', HttpStatus.BAD_REQUEST);
    }

    const orderId = `NL-ORDER-${Date.now()}`;
    const amount = membership.price;

    // Buat transaksi di Midtrans
    const orderData = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: user.username,
        email: user.email,
        phone: '',
      },
    };

    try {
      const snapToken = await this.handleTransaction(orderData);
      return snapToken;
    } catch (error) {
      throw new HttpException(
        'Midtrans transaction failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  verifySignature(payload: any, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha512', this.serverKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return expectedSignature === signature;
  }

  async createAfterSuccessPayment(data: CreateTransactionDto) {
    // Simpan transaksi dengan status pending
    const transaction = this.transactionsRepository.create(data);
    await this.transactionsRepository.save(transaction);
  }
}
