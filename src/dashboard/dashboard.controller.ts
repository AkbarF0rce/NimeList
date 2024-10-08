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

  @Get('bar-chart')
  getSalesData(@Query('year') year: number) {
    // Data penjualan berdasarkan tahun yang dipilih
    const salesData = {
      2020: [
        { month: 'January', income: 500000 },
        { month: 'February', income: 700000 },
        { month: 'March', income: 780000 },
      ],
      2021: [
        { month: 'January', income: 600000 },
        { month: 'February', income: 800000 },
      ],
      2022: [
        { month: 'January', income: 750000 },
        { month: 'February', income: 900000 },
      ],
      2023: [
        { month: 'January', income: 850000 },
        { month: 'February', income: 950000 },
      ],
      2024: [
        { month: 'January', income: 850000 },
        { month: 'February', income: 950000 },
      ],
    };

    return salesData[year] || [];
  }
}
