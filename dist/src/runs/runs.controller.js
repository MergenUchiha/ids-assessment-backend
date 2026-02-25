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
exports.RunsController = void 0;
const common_1 = require("@nestjs/common");
const runs_service_1 = require("./runs.service");
let RunsController = class RunsController {
    runsService;
    constructor(runsService) {
        this.runsService = runsService;
    }
    create(experimentId, scenarioId) {
        return this.runsService.createRun(experimentId, scenarioId);
    }
    get(runId) {
        return this.runsService.getRun(runId);
    }
    report(runId) {
        return this.runsService.getReport(runId);
    }
    async alerts(runId, page = '1', limit = '50') {
        return this.runsService.getAlerts(runId, Number(page), Number(limit));
    }
};
exports.RunsController = RunsController;
__decorate([
    (0, common_1.Post)(':experimentId/:scenarioId'),
    __param(0, (0, common_1.Param)('experimentId')),
    __param(1, (0, common_1.Param)('scenarioId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RunsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':runId'),
    __param(0, (0, common_1.Param)('runId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RunsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':runId/report'),
    __param(0, (0, common_1.Param)('runId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RunsController.prototype, "report", null);
__decorate([
    (0, common_1.Get)(':runId/alerts'),
    __param(0, (0, common_1.Param)('runId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RunsController.prototype, "alerts", null);
exports.RunsController = RunsController = __decorate([
    (0, common_1.Controller)('runs'),
    __metadata("design:paramtypes", [runs_service_1.RunsService])
], RunsController);
//# sourceMappingURL=runs.controller.js.map