"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bull_1 = require("@nestjs/bull");
let RunsService = class RunsService {
    prisma;
    runsQueue;
    constructor(prisma, runsQueue) {
        this.prisma = prisma;
        this.runsQueue = runsQueue;
    }
    async createRun(experimentId, scenarioId) {
        const [experiment, scenario] = await Promise.all([
            this.prisma.experiment.findUnique({ where: { id: experimentId } }),
            this.prisma.scenario.findUnique({ where: { id: scenarioId } }),
        ]);
        if (!experiment)
            throw new common_1.NotFoundException(`Experiment ${experimentId} not found`);
        if (!scenario)
            throw new common_1.NotFoundException(`Scenario ${scenarioId} not found`);
        const defaultProfile = await this.prisma.idsProfile.findFirst({
            where: { name: 'default' },
        });
        const run = await this.prisma.run.create({
            data: {
                experimentId,
                scenarioId,
                idsProfileId: defaultProfile?.id ?? null,
                status: 'QUEUED',
            },
            include: { scenario: true, idsProfile: true },
        });
        await this.runsQueue.add('execute-run', { runId: run.id });
        return run;
    }
    async getRun(runId) {
        const run = await this.prisma.run.findUnique({
            where: { id: runId },
            include: {
                scenario: true,
                idsProfile: true,
                alerts: { orderBy: { timestamp: 'asc' } },
                metrics: true,
                attackEvents: { orderBy: { timestamp: 'asc' } },
            },
        });
        if (!run)
            throw new common_1.NotFoundException(`Run ${runId} not found`);
        return run;
    }
    async getReport(runId) {
        const run = await this.prisma.run.findUnique({
            where: { id: runId },
            include: {
                scenario: true,
                experiment: true,
                metrics: true,
                idsProfile: true,
                attackEvents: { orderBy: { timestamp: 'asc' } },
                _count: { select: { alerts: true } },
            },
        });
        if (!run)
            throw new common_1.NotFoundException(`Run ${runId} not found`);
        return {
            runId: run.id,
            experiment: run.experiment.name,
            scenario: run.scenario?.name ?? null,
            idsProfile: run.idsProfile?.name ?? null,
            status: run.status,
            attackSuccess: run.attackSuccess ?? null,
            metrics: run.metrics ?? null,
            alertsCount: run._count.alerts,
            startedAt: run.startedAt ?? null,
            finishedAt: run.finishedAt ?? null,
            attackEvents: run.attackEvents,
        };
    }
    async getAlerts(runId, page, limit) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(100, Math.max(1, limit));
        const skip = (safePage - 1) * safeLimit;
        const [data, total] = await Promise.all([
            this.prisma.alert.findMany({
                where: { runId },
                skip,
                take: safeLimit,
                orderBy: { timestamp: 'asc' },
            }),
            this.prisma.alert.count({ where: { runId } }),
        ]);
        return { total, page: safePage, limit: safeLimit, data };
    }
};
exports.RunsService = RunsService;
exports.RunsService = RunsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)('runs')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], RunsService);
//# sourceMappingURL=runs.service.js.map