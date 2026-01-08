import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Get all tests
    const tests = await this.prisma.test.findMany({
      include: {
        results: true,
      },
    });

    const totalTests = tests.length;
    const activeTests = tests.filter((t) => t.status === 'running').length;

    let totalAttacks = 0;
    let detectedAttacks = 0;
    let falsePositives = 0;
    let totalDetectionTime = 0;
    let detectionCount = 0;

    tests.forEach((test) => {
      totalAttacks += test.totalAttacks;
      detectedAttacks += test.detectedAttacks;
      falsePositives += test.falsePositives;

      test.results.forEach((result) => {
        if (result.idsDetected && result.detectionTime) {
          totalDetectionTime += result.detectionTime;
          detectionCount++;
        }
      });
    });

    const detectionRate = totalAttacks > 0 ? (detectedAttacks / totalAttacks) * 100 : 0;
    const falsePositiveRate = totalAttacks > 0 ? (falsePositives / totalAttacks) * 100 : 0;
    const avgDetectionTime = detectionCount > 0 ? Math.round(totalDetectionTime / detectionCount) : 0;

    return {
      totalTests,
      activeTests,
      totalAttacks,
      detectedAttacks,
      detectionRate: parseFloat(detectionRate.toFixed(2)),
      falsePositiveRate: parseFloat(falsePositiveRate.toFixed(2)),
      avgDetectionTime,
    };
  }
}