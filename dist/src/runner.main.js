"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const runner_module_1 = require("./runner/runner.module");
async function bootstrap() {
    await core_1.NestFactory.createApplicationContext(runner_module_1.RunnerModule);
}
bootstrap();
//# sourceMappingURL=runner.main.js.map