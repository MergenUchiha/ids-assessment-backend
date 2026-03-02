import { IdsProfilesService } from './ids-profiles.service';
export declare class IdsProfilesController {
    private readonly service;
    constructor(service: IdsProfilesService);
    create(body: {
        name: string;
        ruleset: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        ruleset: string;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        ruleset: string;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        ruleset: string;
    }>;
}
