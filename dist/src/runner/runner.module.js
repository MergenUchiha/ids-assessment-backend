"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../prisma/prisma.module");
const queue_module_1 = require("../queue/queue.module");
const runs_processor_1 = require("./runs.processor");
const docker_exec_service_1 = require("./lab/docker-exec.service");
const eve_json_reader_1 = require("./lab/eve-json.reader");
let RunnerModule = class RunnerModule {
};
exports.RunnerModule = RunnerModule;
exports.RunnerModule = RunnerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            queue_module_1.QueueModule,
        ],
        providers: [runs_processor_1.RunsProcessor, docker_exec_service_1.DockerExecService, eve_json_reader_1.EveJsonReader],
    })
], RunnerModule);
//# sourceMappingURL=runner.module.js.map