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

  @Get('anime-top')
  async getTopAllTime() {
    return await this.dashboardService.getAnimeTopAllTime();
  }

  @Get('income-data')
  async getIncomeData(@Query('year') year: number) {
    return await this.dashboardService.getIncomeData(year);
  }
}
