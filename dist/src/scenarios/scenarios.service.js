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
exports.ScenariosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ScenariosService = class ScenariosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.scenario.create({ data });
    }
    findAll() {
        return this.prisma.scenario.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        const scenario = await this.prisma.scenario.findUnique({ where: { id } });
        if (!scenario)
            throw new common_1.NotFoundException(`Scenario ${id} not found`);
        return scenario;
    }
    async remove(id) {
        await this.prisma.run.updateMany({
            where: { scenarioId: id },
            data: { scenarioId: null },
        });
        return this.prisma.scenario.delete({ where: { id } });
    }
};
exports.ScenariosService = ScenariosService;
exports.ScenariosService = ScenariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScenariosService);
//# sourceMappingURL=scenarios.service.js.map