"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const docker_exec_service_1 = require("./lab/docker-exec.service");
const eve_json_reader_1 = require("./lab/eve-json.reader");
const path = __importStar(require("path"));
let RunsProcessor = class RunsProcessor {
    prisma;
    dockerExec;
    eveReader;
    constructor(prisma, dockerExec, eveReader) {
        this.prisma = prisma;
        this.dockerExec = dockerExec;
        this.eveReader = eveReader;
    }
    async handle(job) {
        console.log('CWD:', process.cwd());
        const { runId } = job.data;
        const evePath = path.resolve(process.cwd(), '..', 'artifacts', 'suricata', 'eve.json');
        const run = await this.prisma.run.findUnique({
            where: { id: runId },
            include: {
                scenario: true,
                idsProfile: true,
            },
        });
        if (!run || !run.scenario)
            throw new Error('Run or Scenario not found');
        const attackerContainer = 'ids_attacker';
        const victimHost = 'victim';
        const startedAt = new Date();
        await this.prisma.run.update({
            where: { id: runId },
            data: { status: 'RUNNING', startedAt },
        });
        await this.prisma.attackEvent.create({
            data: {
                runId,
                type: 'attack_start',
                timestamp: startedAt,
            },
        });
        try {
            const scenario = run.scenario;
            const msfCommand = `
        use ${scenario.msfModule};
        set RHOSTS ${victimHost};
        set RPORT ${scenario.rport ?? 80};
        run;
        exit;
      `;
            const fullCommand = [
                'sh',
                '-lc',
                `bundle exec msfconsole -q -x "${msfCommand.replace(/\n/g, ' ')}"`,
            ];
            const output = await this.dockerExec.execInContainer(attackerContainer, fullCommand);
            await this.dockerExec.execInContainer(attackerContainer, [
                'sh',
                '-lc',
                "printf 'GET / HTTP/1.1\r\nHost: victim\r\n\r\n' | nc victim 80 || true",
            ]);
            await new Promise((r) => setTimeout(r, 1500));
            const finishedAt = new Date();
            await this.prisma.attackEvent.create({
                data: {
                    runId,
                    type: 'attack_end',
                    timestamp: finishedAt,
                },
            });
            const attackSuccess = output.includes('Exploit completed') ||
                output.includes('Meterpreter session') ||
                output.includes('Auxiliary module execution completed');
            await this.prisma.attackEvent.create({
                data: {
                    runId,
                    type: attackSuccess ? 'attack_success' : 'attack_fail',
                    data: { snippet: output.slice(0, 1000) },
                },
            });
            const alerts = this.eveReader.readAlertsInWindow(evePath, new Date(startedAt.getTime() - 30000), new Date(finishedAt.getTime() + 30000));
            alerts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            for (const a of alerts) {
                await this.prisma.alert.create({
                    data: {
                        runId,
                        timestamp: new Date(a.timestamp),
                        signature: a.alert?.signature ?? 'unknown',
                        severity: a.alert?.severity ?? 0,
                        srcIp: a.src_ip ?? 'unknown',
                        destIp: a.dest_ip ?? 'unknown',
                        raw: a,
                    },
                });
            }
            const startMs = startedAt.getTime();
            const endMs = finishedAt.getTime() + 30000;
            const relevantAlerts = alerts.filter((a) => {
                const ts = new Date(a.timestamp).getTime();
                if (ts < startMs)
                    return false;
                if (ts > endMs)
                    return false;
                if (scenario.expectedSignatures.length) {
                    return scenario.expectedSignatures.includes(a.alert?.signature ?? '');
                }
                return true;
            });
            const detected = relevantAlerts.length > 0;
            let tp = 0;
            let fp = 0;
            let fn = 0;
            if (attackSuccess && detected)
                tp = 1;
            if (attackSuccess && !detected)
                fn = 1;
            if (!attackSuccess && detected)
                fp = 1;
            const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
            const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
            const f1 = precision + recall > 0
                ? (2 * precision * recall) / (precision + recall)
                : 0;
            let latencyMs = null;
            if (tp === 1) {
                latencyMs = new Date(relevantAlerts[0].timestamp).getTime() - startMs;
            }
            await this.prisma.metric.upsert({
                where: { runId },
                update: { tp, fp, fn, precision, recall, f1, latencyMs },
                create: { runId, tp, fp, fn, precision, recall, f1, latencyMs },
            });
            await this.prisma.run.update({
                where: { id: runId },
                data: {
                    status: 'FINISHED',
                    finishedAt,
                    attackSuccess,
                },
            });
            return { ok: true };
        }
        catch (e) {
            await this.prisma.attackEvent.create({
                data: {
                    runId,
                    type: 'error',
                    data: {
                        message: String(e?.message ?? e),
                    },
                },
            });
            await this.prisma.run.update({
                where: { id: runId },
                data: { status: 'FAILED', finishedAt: new Date() },
            });
            throw e;
        }
    }
};
exports.RunsProcessor = RunsProcessor;
__decorate([
    (0, bull_1.Process)('execute-run'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RunsProcessor.prototype, "handle", null);
exports.RunsProcessor = RunsProcessor = __decorate([
    (0, bull_1.Processor)('runs'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        docker_exec_service_1.DockerExecService,
        eve_json_reader_1.EveJsonReader])
], RunsProcessor);
//# sourceMappingURL=runs.processor.js.map