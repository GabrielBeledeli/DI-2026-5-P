import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService, DashboardParams } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Query() query: DashboardParams) {
    return this.dashboardService.getStats(query);
  }
}
