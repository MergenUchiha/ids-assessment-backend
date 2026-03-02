// src/runs/runs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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
    // Проверяем что experiment и scenario существуют
    const [experiment, scenario] = await Promise.all([
      this.prisma.experiment.findUnique({ where: { id: experimentId } }),
      this.prisma.scenario.findUnique({ where: { id: scenarioId } }),
    ]);

    if (!experiment)
      throw new NotFoundException(`Experiment ${experimentId} not found`);
    if (!scenario)
      throw new NotFoundException(`Scenario ${scenarioId} not found`);

    // Берём дефолтный IDS профиль если есть
    const defaultProfile = await this.prisma.idsProfile.findFirst({
      where: { name: 'default' },
    });

    const run = await this.prisma.run.create({
      data: {
        experimentId,
        scenarioId,
        idsProfileId: defaultProfile?.id ?? null,
        status: 'QUEUED',
      },
      include: { scenario: true, idsProfile: true },
    });

    await this.runsQueue.add('execute-run', { runId: run.id });
    return run;
  }

  async getRun(runId: string) {
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
      include: {
        scenario: true,
        idsProfile: true,
        alerts: { orderBy: { timestamp: 'asc' } },
        metrics: true,
        attackEvents: { orderBy: { timestamp: 'asc' } },
      },
    });
    if (!run) throw new NotFoundException(`Run ${runId} not found`);
    return run;
  }

  async getReport(runId: string) {
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
      include: {
        scenario: true,
        experiment: true,
        metrics: true,
        idsProfile: true,
        attackEvents: { orderBy: { timestamp: 'asc' } },
        _count: { select: { alerts: true } },
      },
    });

    if (!run) throw new NotFoundException(`Run ${runId} not found`);

    return {
      runId: run.id,
      experiment: run.experiment.name,
      scenario: run.scenario?.name ?? null,
      idsProfile: run.idsProfile?.name ?? null,
      status: run.status,
      attackSuccess: run.attackSuccess ?? null,
      metrics: run.metrics ?? null,
      alertsCount: run._count.alerts,
      startedAt: run.startedAt ?? null,
      finishedAt: run.finishedAt ?? null,
      attackEvents: run.attackEvents,
    };
  }

  async getAlerts(runId: string, page: number, limit: number) {
    // Валидация пагинации
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      this.prisma.alert.findMany({
        where: { runId },
        skip,
        take: safeLimit,
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.alert.count({ where: { runId } }),
    ]);

    return { total, page: safePage, limit: safeLimit, data };
  }
}
