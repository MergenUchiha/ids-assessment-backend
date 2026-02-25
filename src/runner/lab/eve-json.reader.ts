import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

type EveAlert = {
  timestamp: string;
  event_type: string;
  alert?: { signature: string; severity: number };
  src_ip?: string;
  dest_ip?: string;
};

@Injectable()
export class EveJsonReader {
  readAlertsInWindow(evePath: string, start: Date, end: Date): EveAlert[] {
    if (!fs.existsSync(evePath)) return [];

    const lines = fs.readFileSync(evePath, 'utf-8').split('\n').filter(Boolean);
    const res: EveAlert[] = [];

    for (const line of lines) {
      try {
        const e = JSON.parse(line) as EveAlert;
        if (e.event_type !== 'alert') continue;
        const ts = new Date(e.timestamp);
        if (ts >= start && ts <= end) res.push(e);
      } catch {
        // ignore broken lines
      }
    }
    return res;
  }
}
