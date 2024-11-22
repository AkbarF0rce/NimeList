import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/AuthModule/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/AuthModule/common/guards/roles.guard';
import { Roles } from 'src/AuthModule/common/decorators/roles.decorator';
import { AnimeService } from 'src/AnimeModule/anime/anime.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

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
  async getReportData(@Query('year') year: number) {
    return await this.dashboardService.getReportData(year);
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
