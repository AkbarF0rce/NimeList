// src/midtrans/midtrans.service.ts

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { status, Transaction } from './entities/transaction.entity';
import { ILike, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PremiumService } from 'src/premium/premium.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { badges, status_premium, User } from 'src/user/entities/user.entity';
import { Premium } from 'src/premium/entities/premium.entity';
import * as fetch from 'node-fetch';
import { nanoid } from 'nanoid';

@Injectable()
export class TransactionService {
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
  ) {}

  async handleTransaction(data: any) {
    // Midtrans API untuk membuat transaksi
    const url = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: this.configService.get<string>('MIDTRANS_AUTHORIZATION'),
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(url, options);
    return response.json();
  }

  async createTransactionToken(userId: string, membershipId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const membership = await this.premiumService.findById(membershipId);
    if (!membership) {
      throw new HttpException('Membership not found', HttpStatus.BAD_REQUEST);
    }

    const orderId = `NL${nanoid(13)}`;
    const amount = membership.price;

    // Transaksi detail
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
      },
      metadata: {
        user_id: userId,
        premium_id: membershipId,
      },
    };

    try {
      const data = await this.handleTransaction(orderData);
      return data;
    } catch (error) {
      throw new HttpException(
        'Midtrans transaction failed ' + error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPayment(data: CreateTransactionDto) {
    // Simpan transaksi dengan status pending
    const transaction = this.transactionsRepository.create(data);
    const save = await this.transactionsRepository.save(transaction);
  }

  async handleNotification(notification: any) {
    const { order_id, transaction_status, fraud_status } = notification;
    console.log(notification);

    // Cek status pembayaran dari Midtrans
    if (transaction_status === 'settlement' && fraud_status === 'accept') {
      // Ambil data transaksi berdasarkan order_id
      const transaction = await this.transactionsRepository.findOne({
        where: { order_id: order_id },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update status transaksi menjadi sukses
      transaction.status = status.SUCCESS;
      transaction.payment_platform = notification.issuer;
      await this.transactionsRepository.save(transaction);

      // Setelah transaksi sukses, lakukan update pada user
      const premium = await this.premiumRepository.findOne({
        where: { id: transaction.id_premium },
      });

      const user = await this.usersRepository.findOne({
        where: { id: transaction.id_user },
      });

      if (!user || !premium) {
        throw new Error('User or premium data not found');
      }

      const current_time = new Date();

      if (
        user.status_premium === status_premium.ACTIVE &&
        user.end_premium > current_time
      ) {
        // Overwrite tanpa memperpanjang jika masih aktif
        user.badge = badges.NIMELIST_HEROES;
        user.start_premium = current_time;
        const newEndPremium = new Date(
          user.end_premium.getTime() + premium.duration * 24 * 60 * 60 * 1000,
        );

        // Atur waktu menjadi jam 12 malam (00:00:00) pada tanggal baru
        user.end_premium = new Date(
          newEndPremium.getFullYear(),
          newEndPremium.getMonth(),
          newEndPremium.getDate(),
        );
      } else {
        // Update status premium
        user.badge = badges.NIMELIST_HEROES;
        user.status_premium = status_premium.ACTIVE;
        user.start_premium = current_time;
        const newEndPremium = new Date(
          current_time.getTime() + premium.duration * 24 * 60 * 60 * 1000,
        );

        // Atur waktu menjadi jam 12 malam (00:00:00) pada tanggal baru
        user.end_premium = new Date(
          newEndPremium.getFullYear(),
          newEndPremium.getMonth(),
          newEndPremium.getDate(),
        );
      }

      // Simpan perubahan pada user
      await this.usersRepository.save(user);

      return { message: 'Transaction and user updated successfully' };
    } else if (transaction_status === 'pending') {
      const data: any = {
        order_id: order_id,
        payment_platform: notification.payment_type,
        total: parseInt(notification.gross_amount),
        id_user: notification.metadata.user_id,
        id_premium: notification.metadata.premium_id,
      };

      if (notification.payment_type === 'bank_transfer') {
        data.payment_platform = notification.va_numbers[0].bank;
      }
      await this.createPayment(data);
    } else if (
      transaction_status === 'expire' ||
      transaction_status === 'cancel'
    ) {
      // Update transaksi jika pembayaran expired atau dibatalkan
      const transaction = await this.transactionsRepository.findOne({
        where: { order_id: order_id },
      });

      if (transaction) {
        transaction.status = status.FAILED;
        await this.transactionsRepository.save(transaction);
      }

      return { message: 'Transaction failed or expired' };
    }

    return { message: 'Unhandled transaction status' };
  }

  async getTransaction(
    page: number,
    limit: number,
    search: string,
    status: string,
    premium: string,
  ) {
    const transactionsQuery = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user') // Join table user
      .leftJoin('transaction.premium', 'premium') // Join table premium
      .select(['transaction', 'user', 'premium']);

    // Tambahan kondisi WHERE untuk pencarian
    if (search) {
      transactionsQuery
        .where('user.username ILIKE :search', { search: `%${search}%` })
        .orWhere('transaction.order_id ILIKE :search', {
          search: `%${search}%`,
        });
    }

    // Tambahkan kondisi AND WHERE jika status !== 'all'
    if (status && status !== 'all') {
      transactionsQuery.andWhere('transaction.status = :status', {
        status,
      });
    }

    // Tambahkan kondisi AND WHERE jika premium !== 'all'
    if (premium && premium !== 'all') {
      transactionsQuery.andWhere('premium.name = :premium', { premium });
    }

    // Pagination dan Sorting
    const [transactions, total] = await transactionsQuery
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('transaction.created_at', 'DESC')
      .getManyAndCount();

    const result = transactions.map((transaction) => ({
      id: transaction.id,
      order_id: transaction.order_id,
      status: transaction.status,
      total: transaction.total,
      username: transaction.user.username,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    }));

    return {
      data: result,
      total,
    };
  }

  async getTransactionById(id: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id: id },
      relations: ['user', 'premium'],
    });

    return {
      order_id: transaction.order_id,
      payment_platform: transaction.payment_platform,
      username: transaction.user.username,
      premium: transaction.premium,
      status: transaction.status,
      total: transaction.total,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }
}
