import { ExperimentsService } from './experiments.service';
export declare class ExperimentsController {
    private readonly service;
    constructor(service: ExperimentsService);
    create(body: {
        name: string;
        description?: string;
    }): import(".prisma/client").Prisma.Prisma__ExperimentClient<{
        runs: ({
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
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        runs: ({
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
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
    })[]>;
    findOne(id: string): Promise<{
        runs: ({
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
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
    }>;
}
