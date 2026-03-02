import { RunsService } from './runs.service';
export declare class RunsController {
    private readonly runsService;
    constructor(runsService: RunsService);
    create(experimentId: string, scenarioId: string): Promise<{
        idsProfile: {
            id: string;
            createdAt: Date;
            name: string;
            ruleset: string;
        } | null;
        scenario: {
            id: string;
            createdAt: Date;
            name: string;
            rport: number | null;
            description: string | null;
            msfModule: string;
            payload: string | null;
            expectedSignatures: string[];
        } | null;
    } & {
        id: string;
        startedAt: Date | null;
        finishedAt: Date | null;
        status: import(".prisma/client").$Enums.RunStatus;
        attackSuccess: boolean | null;
        evePath: string | null;
        msfLogPath: string | null;
        experimentId: string;
        scenarioId: string | null;
        idsProfileId: string | null;
    }>;
    get(runId: string): Promise<{
        idsProfile: {
            id: string;
            createdAt: Date;
            name: string;
            ruleset: string;
        } | null;
        scenario: {
            id: string;
            createdAt: Date;
            name: string;
            rport: number | null;
            description: string | null;
            msfModule: string;
            payload: string | null;
            expectedSignatures: string[];
        } | null;
        attackEvents: {
            data: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            type: string;
            timestamp: Date;
            runId: string;
        }[];
        alerts: {
            id: string;
            timestamp: Date;
            runId: string;
            signature: string;
            severity: number;
            srcIp: string;
            destIp: string;
            raw: import("@prisma/client/runtime/library").JsonValue;
        }[];
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
    } & {
        id: string;
        startedAt: Date | null;
        finishedAt: Date | null;
        status: import(".prisma/client").$Enums.RunStatus;
        attackSuccess: boolean | null;
        evePath: string | null;
        msfLogPath: string | null;
        experimentId: string;
        scenarioId: string | null;
        idsProfileId: string | null;
    }>;
    report(runId: string): Promise<{
        runId: string;
        experiment: string;
        scenario: string | null;
        idsProfile: string | null;
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
            data: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            type: string;
            timestamp: Date;
            runId: string;
        }[];
    }>;
    alerts(runId: string, page?: string, limit?: string): Promise<{
        total: number;
        page: number;
        limit: number;
        data: {
            id: string;
            timestamp: Date;
            runId: string;
            signature: string;
            severity: number;
            srcIp: string;
            destIp: string;
            raw: import("@prisma/client/runtime/library").JsonValue;
        }[];
    }>;
}
