import { PrismaService } from '../prisma/prisma.service';
export declare class ScenariosService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        description?: string;
        msfModule: string;
        payload?: string;
        rport?: number;
        expectedSignatures?: string[];
    }): import(".prisma/client").Prisma.Prisma__ScenarioClient<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        msfModule: string;
        payload: string | null;
        rport: number | null;
        expectedSignatures: string[];
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        msfModule: string;
        payload: string | null;
        rport: number | null;
        expectedSignatures: string[];
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ScenarioClient<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        msfModule: string;
        payload: string | null;
        rport: number | null;
        expectedSignatures: string[];
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ScenarioClient<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        msfModule: string;
        payload: string | null;
        rport: number | null;
        expectedSignatures: string[];
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
