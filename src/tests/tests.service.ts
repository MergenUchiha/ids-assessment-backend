import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tests = await this.prisma.test.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        scenario: {
          select: {
            id: true,
            name: true,
            exploitType: true,
          },
        },
      },
    });

    return tests.map((test) => ({
      ...test,
      scenarioName: test.scenario.name,
    }));
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
    await this.findOne(id); // Check if test exists

    return this.prisma.testResult.findMany({
      where: { testId: id },
      orderBy: { timestamp: 'desc' },
    });
  }
}