import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async findAll() {
    return this.reportsService.findAll();
  }

  @Post('generate')
  async generate(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.generate(createReportDto);
  }
}