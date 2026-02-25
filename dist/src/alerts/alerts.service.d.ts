import { PrismaService } from '../prisma/prisma.service';
export declare class AlertsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        timestamp: Date;
        runId: string;
        signature: string;
        severity: number;
        srcIp: string;
        destIp: string;
        raw: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
