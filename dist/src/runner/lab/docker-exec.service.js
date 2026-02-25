"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerExecService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
let DockerExecService = class DockerExecService {
    execInContainer(containerName, cmd) {
        return new Promise((resolve, reject) => {
            const args = ['exec', containerName, ...cmd];
            (0, child_process_1.execFile)('docker', args, { windowsHide: true }, (err, stdout, stderr) => {
                if (err) {
                    const message = [
                        'docker exec failed',
                        `container=${containerName}`,
                        `cmd=${cmd.join(' ')}`,
                        `stderr=${stderr}`,
                    ].join('\n');
                    return reject(new Error(message));
                }
                resolve(stdout || stderr || '');
            });
        });
    }
};
exports.DockerExecService = DockerExecService;
exports.DockerExecService = DockerExecService = __decorate([
    (0, common_1.Injectable)()
], DockerExecService);
//# sourceMappingURL=docker-exec.service.js.map