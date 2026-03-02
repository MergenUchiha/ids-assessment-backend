// src/experiments/experiments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExperimentsService {
  constructor(private prisma: PrismaService) {}

  create(name: string, description?: string) {
    return this.prisma.experiment.create({
      data: { name, description },
      include: {
        runs: { include: { scenario: true, idsProfile: true, metrics: true } },
      },
    });
  }

  findAll() {
    return this.prisma.experiment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        runs: {
          orderBy: { startedAt: 'desc' },
          include: {
            scenario: true,
            idsProfile: true,
            metrics: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const exp = await this.prisma.experiment.findUnique({
      where: { id },
      include: {
        runs: {
          orderBy: { startedAt: 'desc' },
          include: { scenario: true, idsProfile: true, metrics: true },
        },
      },
    });
    if (!exp) throw new NotFoundException(`Experiment ${id} not found`);
    return exp;
  }

  /**
   * Prisma schema не имеет onDelete: Cascade — удаляем вручную.
   * Порядок важен: сначала дочерние таблицы, потом runs, потом experiment.
   */
  async remove(id: string) {
    const runs = await this.prisma.run.findMany({
      where: { experimentId: id },
      select: { id: true },
    });
    const runIds = runs.map((r) => r.id);

    if (runIds.length > 0) {
      await this.prisma.metric.deleteMany({ where: { runId: { in: runIds } } });
      await this.prisma.attackEvent.deleteMany({
        where: { runId: { in: runIds } },
      });
      await this.prisma.alert.deleteMany({ where: { runId: { in: runIds } } });
      await this.prisma.run.deleteMany({ where: { experimentId: id } });
    }

    return this.prisma.experiment.delete({ where: { id } });
  }
}
