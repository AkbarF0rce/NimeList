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

  @Post('post')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async createTransaction(@Req() req, @Body() body: CreateTransactionDto) {
    body.id_user = req.user.userId;
    const { id_user, id_premium } = body;

    return await this.transactionService.createMidtransToken(
      id_user,
      id_premium,
    );
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

  @Get('get-by-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async getTransactionByUser(@Request() req) {
    return await this.transactionService.getTransactionByUser(req.user.userId);
  }

  @Get('get/:order_id')
  @UseGuards(JwtAuthGuard)
  async getTransactionById(@Param('order_id') order_id: string, @Request() req) {
    return await this.transactionService.getTransactionByOrderId(order_id, req.user);
  }
}
