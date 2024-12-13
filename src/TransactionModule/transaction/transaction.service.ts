import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { status, Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/UserModule/user/user.service';
import { PremiumService } from 'src/TransactionModule/premium/premium.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  badges,
  is_premium,
  User,
} from 'src/UserModule/user/entities/user.entity';
import {
  Premium,
  status_premium,
} from 'src/TransactionModule/premium/entities/premium.entity';
import * as crypto from 'crypto';
import { nanoid } from 'nanoid';

// Untuk menyimpan token Midtrans
const tokenStore = new Map<string, string>();

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Premium)
    private premiumRepository: Repository<Premium>,
    private usersService: UserService,
    private premiumService: PremiumService,
  ) {}

  async handleApiMidtrans(data: any) {
    // Midtrans API untuk membuat token
    const url = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: process.env.MIDTRANS_AUTHORIZATION,
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(url, options);
    const { token } = await response.json();

    // Simpan token ke dalam Map
    tokenStore.set(data.transaction_details.order_id, token);

    return { token };
  }

  async createMidtransToken(userId: string, membershipId: string) {
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
      const data = await this.handleApiMidtrans(orderData);
      return data;
    } catch (error) {
      throw new BadRequestException('Failed to create Midtrans token');
    }
  }

  async createPayment(data: CreateTransactionDto) {
    // Simpan transaksi dengan status pending
    const transaction = this.transactionsRepository.create(data);
    await this.transactionsRepository.save(transaction);
  }

  private async updateUser(id_user: string, id_premium: string) {
    // Setelah transaksi sukses, lakukan update pada user
    const premium = await this.premiumRepository.findOne({
      where: { id: id_premium },
    });

    if (premium.status !== status_premium.ACTIVE) {
      throw new BadRequestException('Premium not active');
    }

    const user = await this.usersRepository.findOne({
      where: { id: id_user },
    });

    if (!user || !premium) {
      throw new Error('User or premium data not found');
    }

    const current_time = new Date();
    const duration = premium.duration * 24 * 60 * 60 * 1000;

    if (
      user.status_premium === is_premium.ACTIVE &&
      user.end_premium > current_time
    ) {
      // Perpanjang waktu end premium
      const newEndPremium = new Date(user.end_premium.getTime() + duration);

      // Atur waktu menjadi jam 12 malam
      newEndPremium.setHours(0, 0, 0, 0);

      // Isi waktu end premium dengan waktu yang ditentukan
      user.end_premium = newEndPremium;
    } else {
      // Update status premium
      user.badge = badges.NIMELIST_HEROES;
      user.status_premium = is_premium.ACTIVE;
      user.start_premium = current_time;
      const newEndPremium = new Date(current_time.getTime() + duration);

      // Atur waktu menjadi jam 12 malam
      newEndPremium.setHours(0, 0, 0, 0);

      // Isi waktu end premium dengan waktu yang ditentukan
      user.end_premium = newEndPremium;
    }

    // Simpan perubahan pada user
    const save = await this.usersRepository.save(user);

    if (!save) {
      throw new BadRequestException('User not updated');
    }

    return;
  }

  private async checkNotification(data: any) {
    // Data dari Midtrans notifikasi
    const { order_id, status_code, gross_amount, signature_key } = data;

    // Validasi data
    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return false;
    }

    // Midtrans server key
    const serverKey = process.env.MIDTRNAS_SERVER_KEY;

    // Format: order_id + status_code + gross_amount + server_key
    const input = `${order_id}${status_code}${gross_amount}${serverKey}`;

    // Generate SHA-512 hash local signature
    const localSignature = crypto
      .createHash('sha512')
      .update(input)
      .digest('hex');

    return localSignature === signature_key;
  }

  async handleNotification(notification: any) {
    const { order_id, transaction_status, fraud_status, metadata } =
      notification;

    // Validasi notifikasi
    const isValid = await this.checkNotification(notification);

    if (!isValid) {
      throw new BadRequestException('Invalid notification data');
    }

    // Cek status pembayaran dari Midtrans
    if (transaction_status === 'settlement' && fraud_status === 'accept') {
      // Ambil data transaksi berdasarkan order_id
      const transaction = await this.transactionsRepository.findOne({
        where: { order_id: order_id },
        select: [
          'payment_platform',
          'status',
          'token_midtrans',
          'id_user',
          'id_premium',
        ],
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update data transaksi
      if (notification.payment_type === 'qris') {
        transaction.payment_platform = notification.issuer;
      }
      transaction.status = status.SUCCESS;
      transaction.token_midtrans = null;
      await this.transactionsRepository.update(
        { order_id: order_id },
        transaction,
      );

      // Hapus token dari cache
      tokenStore.delete(order_id);

      // Jika user id dan premium id tidak sesuai dengan data transaksi maka kembalikan error
      if (
        transaction.id_user !== metadata.user_id ||
        transaction.id_premium !== metadata.premium_id
      ) {
        throw new NotFoundException('Transaction not found');
      }

      // Lakukan update pada user
      await this.updateUser(transaction.id_user, transaction.id_premium);

      throw new HttpException('Transaction success and user updated', 200);
    } else if (transaction_status === 'pending') {
      const data: any = {
        order_id: order_id,
        payment_platform: notification.payment_type,
        total: parseInt(notification.gross_amount),
        id_user: notification.metadata.user_id,
        id_premium: notification.metadata.premium_id,
        token_midtrans: tokenStore.get(order_id),
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
        select: ['status', 'token_midtrans'],
      });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      // Update status transaksi dan hapus token
      transaction.status = status.FAILED;
      transaction.token_midtrans = null;
      await this.transactionsRepository.save(transaction);

      // Hapus token dari cache
      tokenStore.delete(order_id);

      throw new HttpException('Transaction expired or canceled', 200);
    }
  }

  async getTransaction(
    page: number,
    limit: number,
    search: string,
    status: string,
    premium: string,
    platform: string,
  ) {
    const transactionsQuery = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .leftJoin('transaction.premium', 'premium')
      .select(['transaction', 'user', 'premium']);

    // Tambahan kondisi WHERE untuk pencarian
    if (search) {
      transactionsQuery
        .where('user.username ILIKE :search', { search: `%${search}%` })
        .orWhere('transaction.order_id ILIKE :search', {
          search: `%${search}%`,
        });
    }

    // Tambahkan kondisi AND WHERE jika status !== 'all' dan ada
    if (status && status !== 'all') {
      transactionsQuery.andWhere('transaction.status = :status', {
        status,
      });
    }

    // Tambahkan kondisi AND WHERE jika premium !== 'all' dan ada
    if (premium && premium !== 'all') {
      transactionsQuery.andWhere('premium.name = :premium', { premium });
    }

    if (platform && platform !== 'null') {
      transactionsQuery.andWhere('transaction.payment_platform = :platform', {
        platform,
      });
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

  async getTransactionByUser(id_user: string) {
    const transactions = await this.transactionsRepository.find({
      where: { id_user: id_user },
      order: { created_at: 'DESC' },
      relations: ['user', 'premium'],
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      order_id: transaction.order_id,
      payment_platform: transaction.payment_platform,
      username: transaction.user.username,
      premium: transaction.premium.name,
      status: transaction.status,
      token_midtrans: transaction.token_midtrans,
      total: transaction.total,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    }));
  }

  async getTransactionByOrderId(order_id: string, user: any) {
    const transaction = await this.transactionsRepository.findOne({
      where: { order_id: order_id },
      relations: ['user', 'premium'],
    });

    if (user.role === 'user' && user.userId !== transaction.user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return {
      order_id: transaction.order_id,
      payment_platform: transaction.payment_platform,
      username: transaction.user.username,
      premium: transaction.premium,
      status: transaction.status,
      total: transaction.total,
      token_midtrans: transaction.token_midtrans,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }
}
