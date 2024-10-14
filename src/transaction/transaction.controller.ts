// src/transactions/transactions.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create')
  async createTransaction(@Body() body: CreateTransactionDto) {
    const { id_user, id_premium } = body;

    if (!id_user || !id_premium) {
      throw new HttpException(
        'userId and membershipId are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.transactionService.createTransaction(id_user, id_premium);
    // return { redirectUrl };
  }

  @Post('success')
  async createAfterSuccessPayment(@Body() body: CreateTransactionDto) {
    return await this.transactionService.createAfterSuccessPayment(body);
  }
}
