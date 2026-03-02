import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { DockerExecService } from './lab/docker-exec.service';
import { EveJsonReader } from './lab/eve-json.reader';
import * as path from 'path';

@Processor('runs')
export class RunsProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dockerExec: DockerExecService,
    private readonly eveReader: EveJsonReader,
  ) {}

  @Process('execute-run')
  async handle(job: Job<{ runId: string }>) {
    const { runId } = job.data;
    const evePath = path.resolve(
      process.cwd(),
      '..',
      'artifacts',
      'suricata',
      'eve.json',
    );

    const run = await this.prisma.run.findUnique({
      where: { id: runId },
      include: {
        scenario: true,
        idsProfile: true,
      },
    });

    if (!run || !run.scenario) throw new Error('Run or Scenario not found');

    const attackerContainer = 'ids_attacker';
    const victimHost = 'victim';

    const startedAt = new Date();

    await this.prisma.run.update({
      where: { id: runId },
      data: { status: 'RUNNING', startedAt },
    });

    await this.prisma.attackEvent.create({
      data: {
        runId,
        type: 'attack_start',
        timestamp: startedAt,
      },
    });

    try {
      const scenario = run.scenario;

      const msfCommand = `
        use ${scenario.msfModule};
        set RHOSTS ${victimHost};
        set RPORT ${scenario.rport ?? 80};
        run;
        exit;
      `;

      const fullCommand = [
        'sh',
        '-lc',
        `bundle exec msfconsole -q -x "${msfCommand.replace(/\n/g, ' ')}"`,
      ];

      const output = await this.dockerExec.execInContainer(
        attackerContainer,
        fullCommand,
      );

      // гарантированный HTTP GET для тестового Suricata правила
      await this.dockerExec.execInContainer(attackerContainer, [
        'sh',
        '-lc',
        "printf 'GET / HTTP/1.1\r\nHost: victim\r\n\r\n' | nc victim 80 || true",
      ]);

      // даём Suricata дописать eve.json (на volume может быть задержка)
      await new Promise((r) => setTimeout(r, 1500));

      const finishedAt = new Date();

      await this.prisma.attackEvent.create({
        data: {
          runId,
          type: 'attack_end',
          timestamp: finishedAt,
        },
      });

      const attackSuccess =
        output.includes('Exploit completed') ||
        output.includes('Meterpreter session') ||
        output.includes('Auxiliary module execution completed');

      await this.prisma.attackEvent.create({
        data: {
          runId,
          type: attackSuccess ? 'attack_success' : 'attack_fail',
          data: { snippet: output.slice(0, 1000) },
        },
      });

      // --- READ ALERTS (широкое окно чтения) ---
      const alerts = this.eveReader.readAlertsInWindow(
        evePath,
        new Date(startedAt.getTime() - 30000),
        new Date(finishedAt.getTime() + 30000),
      );

      alerts.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      // сохраняем ВСЕ алерты, которые попали в wide-window
      for (const a of alerts) {
        await this.prisma.alert.create({
          data: {
            runId,
            timestamp: new Date(a.timestamp),
            signature: a.alert?.signature ?? 'unknown',
            severity: a.alert?.severity ?? 0,
            srcIp: a.src_ip ?? 'unknown',
            destIp: a.dest_ip ?? 'unknown',
            raw: a as any,
          },
        });
      }

      // --- MATCHING LOGIC (узкое окно + сигнатуры) ---
      // узкое окно, чтобы НЕ брать алерты до старта (и избежать отрицательной latency)
      const startMs = startedAt.getTime();
      const endMs = finishedAt.getTime() + 30000; // Δ после атаки

      const relevantAlerts = alerts.filter((a) => {
        const ts = new Date(a.timestamp).getTime();

        // только алерты этого run (исключаем "хвосты" из прошлых запусков)
        if (ts < startMs) return false;
        if (ts > endMs) return false;

        // optional: если заданы expected signatures — фильтруем по ним
        if (scenario.expectedSignatures.length) {
          return scenario.expectedSignatures.includes(a.alert?.signature ?? '');
        }
        return true;
      });

      const detected = relevantAlerts.length > 0;

      // --- METRICS ---
      let tp = 0;
      let fp = 0;
      let fn = 0;

      if (attackSuccess && detected) tp = 1;
      if (attackSuccess && !detected) fn = 1;
      if (!attackSuccess && detected) fp = 1;

      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1 =
        precision + recall > 0
          ? (2 * precision * recall) / (precision + recall)
          : 0;

      let latencyMs: number | null = null;
      if (tp === 1) {
        // relevantAlerts уже гарантированно >= startedAt
        latencyMs = new Date(relevantAlerts[0].timestamp).getTime() - startMs;
      }

      await this.prisma.metric.upsert({
        where: { runId },
        update: { tp, fp, fn, precision, recall, f1, latencyMs },
        create: { runId, tp, fp, fn, precision, recall, f1, latencyMs },
      });

      await this.prisma.run.update({
        where: { id: runId },
        data: {
          status: 'FINISHED',
          finishedAt,
          attackSuccess,
        },
      });

      return { ok: true };
    } catch (e: any) {
      await this.prisma.attackEvent.create({
        data: {
          runId,
          type: 'error',
          data: {
            message: String(e?.message ?? e),
          } as any,
        },
      });

      await this.prisma.run.update({
        where: { id: runId },
        data: { status: 'FAILED', finishedAt: new Date() },
      });

      throw e;
    }
  }
}
