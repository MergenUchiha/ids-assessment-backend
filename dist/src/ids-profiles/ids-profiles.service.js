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
exports.IdsProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IdsProfilesService = class IdsProfilesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(name, ruleset) {
        return this.prisma.idsProfile.create({
            data: { name, ruleset },
        });
    }
    findAll() {
        return this.prisma.idsProfile.findMany();
    }
    remove(id) {
        return this.prisma.idsProfile.delete({
            where: { id },
        });
    }
};
exports.IdsProfilesService = IdsProfilesService;
exports.IdsProfilesService = IdsProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdsProfilesService);
//# sourceMappingURL=ids-profiles.service.js.map