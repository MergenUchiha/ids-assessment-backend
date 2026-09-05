import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Job } from 'bull';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { DockerExecService } from './lab/docker-exec.service';
import { EveJsonReader, type EveAlert } from './lab/eve-json.reader';
import { MSF_MODULE_PATTERN } from '../scenarios/dto/scenario.dto';

/** How long after the attack ends an alert still counts as caused by it. */
const ALERT_TAIL_MS = 30_000;

/** Suricata writes to a volume; give it a moment to flush. */
const EVE_FLUSH_DELAY_MS = 1_500;

@Processor('runs')
export class RunsProcessor {
  private readonly logger = new Logger(RunsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dockerExec: DockerExecService,
    private readonly eveReader: EveJsonReader,
    private readonly config: ConfigService,
  ) {}

  @Process('execute-run')
  async handle(job: Job<{ runId: string }>) {
    const { runId } = job.data;

    const run = await this.prisma.run.findUnique({
      where: { id: runId },
      include: { scenario: true, idsProfile: true },
    });

    if (!run?.scenario) throw new Error('Run or scenario not found');

    const scenario = run.scenario;

    // Checked again here, not only at the API boundary: rows predating the
    // DTO, or written by hand, must not reach msfconsole either.
    if (!MSF_MODULE_PATTERN.test(scenario.msfModule)) {
      await this.fail(
        runId,
        `Refusing to run: "${scenario.msfModule}" is not a valid Metasploit module path`,
      );
      throw new Error('Invalid msfModule');
    }

    const rport = Number(scenario.rport ?? 80);
    if (!Number.isInteger(rport) || rport < 1 || rport > 65535) {
      await this.fail(
        runId,
        `Refusing to run: invalid RPORT ${scenario.rport}`,
      );
      throw new Error('Invalid rport');
    }

    const attacker = this.config.getOrThrow<string>('LAB_ATTACKER_CONTAINER');
    const victim = this.config.getOrThrow<string>('LAB_VICTIM_HOST');
    const evePath = path.resolve(
      process.cwd(),
      this.config.getOrThrow<string>('EVE_JSON_PATH'),
    );

    const startedAt = new Date();

    await this.prisma.run.update({
      where: { id: runId },
      data: { status: 'RUNNING', startedAt, evePath },
    });
    await this.prisma.attackEvent.create({
      data: { runId, type: 'attack_start', timestamp: startedAt },
    });

    try {
      // One argv element per argument, and no `sh -lc` anywhere: the resource
      // script is a single argument to msfconsole, so neither a shell nor the
      // quoting around it can be broken out of.
      const resourceScript = [
        `use ${scenario.msfModule}`,
        `set RHOSTS ${victim}`,
        `set RPORT ${rport}`,
        ...(scenario.payload ? [`set PAYLOAD ${scenario.payload}`] : []),
        'run',
        'exit',
      ].join('; ');

      const { stdout, stderr } = await this.dockerExec.execInContainer(
        attacker,
        ['msfconsole', '-q', '-n', '-x', resourceScript],
      );
      const output = stdout || stderr;

      // A fixed probe so the lab's test signature always has something to
      // match; no interpolation, so it needs no escaping.
      await this.dockerExec
        .execInContainer(attacker, [
          'sh',
          '-c',
          'printf "GET / HTTP/1.1\\r\\nHost: victim\\r\\n\\r\\n" | nc victim 80',
        ])
        .catch(() => undefined);

      await new Promise((r) => setTimeout(r, EVE_FLUSH_DELAY_MS));

      const finishedAt = new Date();

      await this.prisma.attackEvent.create({
        data: { runId, type: 'attack_end', timestamp: finishedAt },
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

      const alerts = await this.eveReader.readAlertsInWindow(
        evePath,
        startedAt,
        new Date(finishedAt.getTime() + ALERT_TAIL_MS),
      );

      for (const alert of alerts) {
        await this.prisma.alert.create({
          data: {
            runId,
            timestamp: new Date(alert.timestamp),
            signature: alert.alert?.signature ?? 'unknown',
            severity: alert.alert?.severity ?? 0,
            srcIp: alert.src_ip ?? 'unknown',
            destIp: alert.dest_ip ?? 'unknown',
            raw: { ...alert },
          },
        });
      }

      const matching = matchAlerts(alerts, scenario.expectedSignatures);
      const detected = matching.length > 0;

      await this.prisma.metric.upsert({
        where: { runId },
        update: metricsFor(run.isBaseline, detected, startedAt, matching),
        create: {
          runId,
          ...metricsFor(run.isBaseline, detected, startedAt, matching),
        },
      });

      await this.prisma.run.update({
        where: { id: runId },
        data: { status: 'FINISHED', finishedAt, attackSuccess, detected },
      });

      return { ok: true };
    } catch (error) {
      await this.fail(runId, String((error as Error)?.message ?? error));
      throw error;
    }
  }

  private async fail(runId: string, message: string) {
    this.logger.error(`Run ${runId} failed: ${message}`);
    await this.prisma.attackEvent.create({
      data: { runId, type: 'error', data: { message } },
    });
    await this.prisma.run.update({
      where: { id: runId },
      data: { status: 'FAILED', finishedAt: new Date() },
    });
  }
}

function matchAlerts(alerts: EveAlert[], expected: string[]): EveAlert[] {
  if (expected.length === 0) return alerts;
  return alerts.filter((a) => expected.includes(a.alert?.signature ?? ''));
}

/**
 * What a run contributes to the confusion matrix.
 *
 * The previous version keyed everything off `attackSuccess`, so an IDS that
 * caught an attack which then failed to land was scored as a **false
 * positive** — the one thing a detection system is supposed to do. Whether an
 * exploit succeeded says nothing about whether the traffic was hostile.
 *
 * What matters is whether an attack was *launched*:
 *
 *   attack run, alert raised     → true positive
 *   attack run, no alert         → false negative
 *   no attack (baseline), alert  → false positive
 *   no attack, no alert          → true negative
 *
 * Baseline runs carry no attack, which is what makes false positives
 * measurable at all; see `Run.isBaseline`. Precision and recall over a single
 * run are only ever 0 or 1, so they are aggregated per experiment rather than
 * stored here — `ExperimentsService.getSummary` does that.
 */
function metricsFor(
  isBaseline: boolean,
  detected: boolean,
  startedAt: Date,
  matching: EveAlert[],
) {
  const tp = !isBaseline && detected ? 1 : 0;
  const fn = !isBaseline && !detected ? 1 : 0;
  const fp = isBaseline && detected ? 1 : 0;
  const tn = isBaseline && !detected ? 1 : 0;

  const latencyMs =
    tp === 1
      ? new Date(matching[0].timestamp).getTime() - startedAt.getTime()
      : null;

  return { tp, fp, fn, tn, latencyMs };
}
