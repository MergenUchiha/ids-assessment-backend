import { PrismaService } from '../prisma/prisma.service';
export declare class IdsProfilesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(name: string, ruleset: string): import(".prisma/client").Prisma.Prisma__IdsProfileClient<{
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
