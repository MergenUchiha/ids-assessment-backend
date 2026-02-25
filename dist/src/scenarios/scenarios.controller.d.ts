import { ScenariosService } from './scenarios.service';
export declare class ScenariosController {
    private readonly service;
    constructor(service: ScenariosService);
    create(body: {
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
        rport: number | null;
        description: string | null;
        msfModule: string;
        payload: string | null;
        expectedSignatures: string[];
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        rport: number | null;
        description: string | null;
        msfModule: string;
        payload: string | null;
        expectedSignatures: string[];
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ScenarioClient<{
        id: string;
        createdAt: Date;
        name: string;
        rport: number | null;
        description: string | null;
        msfModule: string;
        payload: string | null;
        expectedSignatures: string[];
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ScenarioClient<{
        id: string;
        createdAt: Date;
        name: string;
        rport: number | null;
        description: string | null;
        msfModule: string;
        payload: string | null;
        expectedSignatures: string[];
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
