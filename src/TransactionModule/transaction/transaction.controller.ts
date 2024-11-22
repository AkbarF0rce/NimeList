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
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createTransaction(@Body() body: CreateTransactionDto) {
    const { id_user, id_premium } = body;

    if (!id_user || !id_premium) {
      throw new HttpException(
        'userId and membershipId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { token, redirect_url } =
      await this.transactionService.createMidtransToken(id_user, id_premium);
    return { token, redirect_url };
  }

  @Post('handle-notification-midtrans')
  async handleTransaction(@Req() req: Request) {
    return await this.transactionService.handleNotification(req.body);
  }

  @Get('get-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTransaction(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @Query('status') status?: string,
    @Query('premium') premium?: string,
    @Query('platform') platform?: string,
  ) {
    return await this.transactionService.getTransaction(
      page,
      limit,
      search,
      status,
      decodeURIComponent(premium),
      platform,
    );
  }

  @Get('get/:id')
  @UseGuards(JwtAuthGuard)
  async getTransactionById(@Param('id') id: string, @Request() req) {
    return await this.transactionService.getTransactionById(id, req.user);
  }
}
