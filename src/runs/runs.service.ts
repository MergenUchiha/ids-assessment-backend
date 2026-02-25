import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';

@Injectable()
export class RunsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('runs') private readonly runsQueue: Queue,
  ) {}

  async createRun(experimentId: string, scenarioId: string) {
    const run = await this.prisma.run.create({
      data: {
        experimentId,
        scenarioId,
        status: 'QUEUED',
      },
    });

    await this.runsQueue.add('execute-run', { runId: run.id });

    return run;
  }

  async getRun(runId: string) {
    return this.prisma.run.findUnique({
      where: { id: runId },
      include: { alerts: true, metrics: true },
    });
  }

  async getReport(runId: string) {
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
      include: {
        scenario: true,
        experiment: true,
        metrics: true,
        alerts: true,
        attackEvents: true,
        idsProfile: true,
      },
    });

    if (!run) return null;

    return {
      runId: run.id,
      experiment: run.experiment.name,
      scenario: run.scenario?.name,
      idsProfile: run.idsProfile?.name,
      status: run.status,
      attackSuccess: run.attackSuccess,
      metrics: run.metrics,
      alertsCount: run.alerts.length,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      attackEvents: run.attackEvents,
    };
  }

  async getAlerts(runId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.alert.findMany({
        where: { runId },
        skip,
        take: limit,
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.alert.count({ where: { runId } }),
    ]);

    return {
      total,
      page,
      limit,
      data,
    };
  }
}
