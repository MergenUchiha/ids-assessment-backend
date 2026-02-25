import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly service;
    constructor(service: AlertsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        runId: string;
        timestamp: Date;
        signature: string;
        severity: number;
        srcIp: string;
        destIp: string;
        raw: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
