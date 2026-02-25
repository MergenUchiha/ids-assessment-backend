import { IdsProfilesService } from './ids-profiles.service';
export declare class IdsProfilesController {
    private readonly service;
    constructor(service: IdsProfilesService);
    create(body: {
        name: string;
        ruleset: string;
    }): import(".prisma/client").Prisma.Prisma__IdsProfileClient<{
        id: string;
        createdAt: Date;
        name: string;
        ruleset: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        ruleset: string;
    }[]>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__IdsProfileClient<{
        id: string;
        createdAt: Date;
        name: string;
        ruleset: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
