import { PrismaService } from '../prisma/prisma.service';
export declare class ExperimentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(name: string, description?: string): import(".prisma/client").Prisma.Prisma__ExperimentClient<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        runs: {
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
            status: import(".prisma/client").$Enums.RunStatus;
            startedAt: Date | null;
            finishedAt: Date | null;
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
