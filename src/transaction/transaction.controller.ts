import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Request,
  Req,
  Get,
  Query,
  Param,
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
    const { token, redirect_url } =
      await this.transactionService.createTransactionToken(id_user, id_premium);
    return { token, redirect_url };
  }

  @Post('handle-notification-midtrans')
  async handleTransaction(@Req() req: Request) {
    return await this.transactionService.handleNotification(req.body);
  }

  @Get('get-admin')
  async getTransaction(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('status') status: string = 'all',
  ) {
    return await this.transactionService.getTransaction(
      page,
      limit,
      search,
      order,
      status,
    );
  }

  @Get('get-admin/:id')
  async getTransactionById(@Param('id') id: string) {
    return await this.transactionService.getTransactionById(id);
  }
}
