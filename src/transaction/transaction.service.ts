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
import { badges, status_premium, User } from 'src/user/entities/user.entity';
import { Premium } from 'src/premium/entities/premium.entity';

@Injectable()
export class TransactionService {
  private snap: midtransClient.Snap;
  private serverKey: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Premium)
    private premiumRepository: Repository<Premium>,
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
    const save = await this.transactionsRepository.save(transaction);

    // Setelah transaksi, lakukan update pada user
    if (save) {
      // Ambil data premium
      const premium = await this.premiumRepository.findOne({
        where: { id: data.id_premium },
      });

      // Ambil data user
      const user = await this.usersRepository.findOne({
        where: { id: data.id_user },
      });

      const current_time = new Date();

      if (user) {
        if (
          user.status_premium === status_premium.ACTIVE &&
          user.end_premium > current_time
        ) {
          // Overwrite tanpa memperpanjang jika masih aktif
          user.badge = premium.badge;
          user.start_premium = current_time;
          user.end_premium = new Date(
            current_time.getTime() + premium.duration * 24 * 60 * 60 * 1000,
          ); // Menghitung durasi
        } else {
          // Update status premium
          user.badge = premium.badge;
          user.status_premium = status_premium.ACTIVE;
          user.start_premium = current_time;
          user.end_premium = new Date(
            current_time.getTime() + premium.duration * 24 * 60 * 60 * 1000,
          ); // Menghitung durasi
        }

        // Simpan perubahan pada user
        await this.usersRepository.save(user);
      }
    }
  }
}
