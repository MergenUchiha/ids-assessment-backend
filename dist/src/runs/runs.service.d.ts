import { PrismaService } from '../prisma/prisma.service';
import { type Queue } from 'bull';
export declare class RunsService {
    private readonly prisma;
    private readonly runsQueue;
    constructor(prisma: PrismaService, runsQueue: Queue);
    createRun(experimentId: string, scenarioId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RunStatus;
        startedAt: Date | null;
        finishedAt: Date | null;
        attackSuccess: boolean | null;
        evePath: string | null;
        msfLogPath: string | null;
        experimentId: string;
        scenarioId: string | null;
        idsProfileId: string | null;
    }>;
    getRun(runId: string): Promise<({
        metrics: {
            id: string;
            runId: string;
            tp: number;
            fp: number;
            fn: number;
            precision: number | null;
            recall: number | null;
            f1: number | null;
            latencyMs: number | null;
        } | null;
        alerts: {
            id: string;
            runId: string;
            timestamp: Date;
            signature: string;
            severity: number;
            srcIp: string;
            destIp: string;
            raw: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RunStatus;
        startedAt: Date | null;
        finishedAt: Date | null;
        attackSuccess: boolean | null;
        evePath: string | null;
        msfLogPath: string | null;
        experimentId: string;
        scenarioId: string | null;
        idsProfileId: string | null;
    }) | null>;
    getReport(runId: string): Promise<{
        runId: string;
        experiment: string;
        scenario: string | undefined;
        idsProfile: string | undefined;
        status: import(".prisma/client").$Enums.RunStatus;
        attackSuccess: boolean | null;
        metrics: {
            id: string;
            runId: string;
            tp: number;
            fp: number;
            fn: number;
            precision: number | null;
            recall: number | null;
            f1: number | null;
            latencyMs: number | null;
        } | null;
        alertsCount: number;
        startedAt: Date | null;
        finishedAt: Date | null;
        attackEvents: {
            id: string;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            runId: string;
            timestamp: Date;
            type: string;
        }[];
    } | null>;
    getAlerts(runId: string, page: number, limit: number): Promise<{
        total: number;
        page: number;
        limit: number;
        data: {
            id: string;
            runId: string;
            timestamp: Date;
            signature: string;
            severity: number;
            srcIp: string;
            destIp: string;
            raw: import("@prisma/client/runtime/library").JsonValue;
        }[];
    }>;
}
