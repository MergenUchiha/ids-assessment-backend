import { PrismaService } from '../prisma/prisma.service';
export declare class IdsProfilesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(name: string, ruleset: string): Promise<{
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
