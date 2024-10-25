import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('total-topic')
  async getTotal() {
    return await this.dashboardService.getTotalTopic();
  }

  @Get('total-premium')
  async countUserPremium() {
    return await this.dashboardService.countUserPremium();
  }

  @Get('top-10-anime')
  async getTop10AllTime() {
    return await this.dashboardService.getTop10AnimeAllTime();
  }

  @Get('income-data')
  async getIncomeData(@Query('year') year: number) {
    return await this.dashboardService.getIncomeData(year);
  }

  @Get('total-transaction')
  async totalTransaction() {
    return await this.dashboardService.totalTransaction();
  }

  @Get('total-income')
  async totalIncome() {
    return await this.dashboardService.totalIncome();
  }
}
