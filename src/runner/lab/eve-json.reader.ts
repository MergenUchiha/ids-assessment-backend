import { Injectable, Logger } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import * as readline from 'readline';

export interface EveAlert {
  timestamp: string;
  event_type: string;
  alert?: { signature: string; severity: number };
  src_ip?: string;
  dest_ip?: string;
}

@Injectable()
export class EveJsonReader {
  private readonly logger = new Logger(EveJsonReader.name);

  /**
   * Reads alerts inside a time window.
   *
   * Streamed line by line: `readFileSync` held the whole file in memory, and
   * eve.json grows for as long as Suricata runs — the copy that was committed
   * to this repository was already 4.6 MB after a handful of test runs.
   */
  async readAlertsInWindow(
    evePath: string,
    start: Date,
    end: Date,
  ): Promise<EveAlert[]> {
    if (!existsSync(evePath)) {
      this.logger.warn(`eve.json not found at ${evePath}`);
      return [];
    }

    const startMs = start.getTime();
    const endMs = end.getTime();
    const alerts: EveAlert[] = [];

    const lines = readline.createInterface({
      input: createReadStream(evePath, { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    });

    for await (const line of lines) {
      if (!line) continue;

      let event: EveAlert;
      try {
        event = JSON.parse(line) as EveAlert;
      } catch {
        continue; // Suricata can leave a partial line at the tail.
      }

      if (event.event_type !== 'alert') continue;

      const ts = new Date(event.timestamp).getTime();
      if (Number.isNaN(ts) || ts < startMs || ts > endMs) continue;

      alerts.push(event);
    }

    alerts.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return alerts;
  }
}
