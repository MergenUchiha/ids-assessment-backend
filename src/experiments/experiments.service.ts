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
   * The relations carry `onDelete: Cascade` (migration add_cascade_deletes),
   * so deleting the experiment removes its runs and everything under them.
   * The old manual, ordered deletion here duplicated what the database
   * already does — and predated the migration that added the cascade.
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.experiment.delete({ where: { id } });
  }

  /**
   * Aggregates the per-run confusion-matrix cells into experiment-wide
   * precision, recall and F1. These are meaningless on a single run — where
   * they can only be 0 or 1 — which is why they are computed here rather than
   * stored on each Metric.
   */
  async getSummary(id: string) {
    const experiment = await this.findOne(id);

    const totals = { tp: 0, fp: 0, fn: 0, tn: 0 };
    let attackRuns = 0;
    let baselineRuns = 0;
    const latencies: number[] = [];

    for (const run of experiment.runs) {
      if (run.isBaseline) baselineRuns++;
      else attackRuns++;
      const m = run.metrics;
      if (!m) continue;
      totals.tp += m.tp;
      totals.fp += m.fp;
      totals.fn += m.fn;
      totals.tn += m.tn;
      if (m.latencyMs != null) latencies.push(m.latencyMs);
    }

    const { tp, fp, fn } = totals;
    const precision = tp + fp > 0 ? tp / (tp + fp) : null;
    const recall = tp + fn > 0 ? tp / (tp + fn) : null;
    const f1 =
      precision != null && recall != null && precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : null;

    return {
      experimentId: id,
      name: experiment.name,
      runs: experiment.runs.length,
      attackRuns,
      baselineRuns,
      confusionMatrix: totals,
      precision,
      recall,
      f1,
      avgLatencyMs: latencies.length
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : null,
    };
  }
}
