import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.test.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        scenario: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        scenario: true,
        results: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    return test;
  }

  async getResults(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    return this.prisma.testResult.findMany({
      where: { testId: id },
      orderBy: { timestamp: 'desc' },
    });
  }
}