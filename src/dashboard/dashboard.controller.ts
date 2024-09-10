import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

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
}
