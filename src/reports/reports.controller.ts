import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Post('generate')
  async generate(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.generate(createReportDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.reportsService.delete(id);
  }
}