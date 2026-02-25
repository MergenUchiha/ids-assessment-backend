import { ExperimentsService } from './experiments.service';
export declare class ExperimentsController {
    private readonly service;
    constructor(service: ExperimentsService);
    create(body: {
        name: string;
        description?: string;
    }): import(".prisma/client").Prisma.Prisma__ExperimentClient<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        runs: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ExperimentClient<({
        runs: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ExperimentClient<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
