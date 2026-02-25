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
        const run = await this.prisma.run.create({
            data: {
                experimentId,
                scenarioId,
                status: 'QUEUED',
            },
        });
        await this.runsQueue.add('execute-run', { runId: run.id });
        return run;
    }
    async getRun(runId) {
        return this.prisma.run.findUnique({
            where: { id: runId },
            include: { alerts: true, metrics: true },
        });
    }
    async getReport(runId) {
        const run = await this.prisma.run.findUnique({
            where: { id: runId },
            include: {
                scenario: true,
                experiment: true,
                metrics: true,
                alerts: true,
                attackEvents: true,
                idsProfile: true,
            },
        });
        if (!run)
            return null;
        return {
            runId: run.id,
            experiment: run.experiment.name,
            scenario: run.scenario?.name,
            idsProfile: run.idsProfile?.name,
            status: run.status,
            attackSuccess: run.attackSuccess,
            metrics: run.metrics,
            alertsCount: run.alerts.length,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            attackEvents: run.attackEvents,
        };
    }
    async getAlerts(runId, page, limit) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.alert.findMany({
                where: { runId },
                skip,
                take: limit,
                orderBy: { timestamp: 'asc' },
            }),
            this.prisma.alert.count({ where: { runId } }),
        ]);
        return {
            total,
            page,
            limit,
            data,
        };
    }
};
exports.RunsService = RunsService;
exports.RunsService = RunsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)('runs')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], RunsService);
//# sourceMappingURL=runs.service.js.map