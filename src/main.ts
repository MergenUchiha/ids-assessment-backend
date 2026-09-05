// src/main.ts
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // Back on: it was turned off "because it broke snake_case requests",
      // but the real fix is that every endpoint now has a DTO whose fields
      // match. An unknown field is a client bug, not something to silently drop.
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Every route requires a JWT unless marked @Public(). The previous build had
  // a JwtStrategy and no guard at all — main.ts said so in a comment while the
  // whole API answered anonymous callers, including the endpoint that launches
  // Metasploit against the lab.
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  app.enableCors({
    origin: config
      .getOrThrow<string>('CORS_ORIGINS')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  if (config.get<boolean>('SWAGGER_ENABLED')) {
    const doc = new DocumentBuilder()
      .setTitle('IDS Lab API')
      .setDescription(
        'Assessing IDS effectiveness against Metasploit in an isolated lab',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc));
  }

  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}`);
  if (config.get<boolean>('SWAGGER_ENABLED')) {
    logger.log(`Swagger UI at http://localhost:${port}/docs`);
  }
}

void bootstrap();
