"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./prisma/prisma.service");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('IDS Lab API')
        .setDescription('Assessing IDS Effectiveness against Metasploit in Isolated Lab')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    swagger_1.SwaggerModule.setup('docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:4173',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    const prisma = app.get(prisma_service_1.PrismaService);
    await prisma.enableShutdownHooks(app);
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
    console.log(`🚀 Backend running on http://localhost:${port}`);
    console.log(`📚 Swagger: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map