import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async generate(data: CreateReportDto) {
    // Get tests for the report
    const tests = await this.prisma.test.findMany({
      include: {
        scenario: true,
        results: true,
      },
    });

    const testsIncluded = tests.length;
    const fileSize = `${(Math.random() * 3 + 1).toFixed(1)} MB`;

    // In a real app, this would generate actual PDF/CSV/JSON files
    const report = await this.prisma.report.create({
      data: {
        name: data.name,
        type: data.type,
        format: data.format,
        dateRange: data.dateRange,
        testsIncluded,
        fileSize,
        filePath: `/reports/${Date.now()}.${data.format}`,
      },
    });

    return {
      message: 'Report generated successfully',
      report,
    };
  }
}