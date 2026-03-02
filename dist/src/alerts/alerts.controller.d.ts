import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly service;
    constructor(service: AlertsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        run: {
            id: string;
            scenario: {
                name: string;
            } | null;
            experimentId: string;
        };
    } & {
        id: string;
        timestamp: Date;
        runId: string;
        signature: string;
        severity: number;
        srcIp: string;
        destIp: string;
        raw: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
}
