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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperimentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExperimentsService = class ExperimentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(name, description) {
        return this.prisma.experiment.create({
            data: { name, description },
            include: {
                runs: { include: { scenario: true, idsProfile: true, metrics: true } },
            },
        });
    }
    findAll() {
        return this.prisma.experiment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                runs: {
                    orderBy: { startedAt: 'desc' },
                    include: {
                        scenario: true,
                        idsProfile: true,
                        metrics: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const exp = await this.prisma.experiment.findUnique({
            where: { id },
            include: {
                runs: {
                    orderBy: { startedAt: 'desc' },
                    include: { scenario: true, idsProfile: true, metrics: true },
                },
            },
        });
        if (!exp)
            throw new common_1.NotFoundException(`Experiment ${id} not found`);
        return exp;
    }
    async remove(id) {
        const runs = await this.prisma.run.findMany({
            where: { experimentId: id },
            select: { id: true },
        });
        const runIds = runs.map((r) => r.id);
        if (runIds.length > 0) {
            await this.prisma.metric.deleteMany({ where: { runId: { in: runIds } } });
            await this.prisma.attackEvent.deleteMany({
                where: { runId: { in: runIds } },
            });
            await this.prisma.alert.deleteMany({ where: { runId: { in: runIds } } });
            await this.prisma.run.deleteMany({ where: { experimentId: id } });
        }
        return this.prisma.experiment.delete({ where: { id } });
    }
};
exports.ExperimentsService = ExperimentsService;
exports.ExperimentsService = ExperimentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExperimentsService);
//# sourceMappingURL=experiments.service.js.map