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
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(JwtAuthGuard)
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
    @Query('status') status?: string,
    @Query('premium') premium?: string,
  ) {
    return await this.transactionService.getTransaction(
      page,
      limit,
      search,
      status,
      decodeURIComponent(premium),
    );
  }

  @Get('get-admin/:id')
  async getTransactionById(@Param('id') id: string) {
    return await this.transactionService.getTransactionById(id);
  }
}
