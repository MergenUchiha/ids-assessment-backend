import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { DockerExecService } from './lab/docker-exec.service';
import { EveJsonReader } from './lab/eve-json.reader';
export declare class RunsProcessor {
    private readonly prisma;
    private readonly dockerExec;
    private readonly eveReader;
    constructor(prisma: PrismaService, dockerExec: DockerExecService, eveReader: EveJsonReader);
    handle(job: Job<{
        runId: string;
    }>): Promise<{
        ok: boolean;
    }>;
}
