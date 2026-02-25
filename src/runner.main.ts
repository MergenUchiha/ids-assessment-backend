import { NestFactory } from '@nestjs/core';
import { RunnerModule } from './runner/runner.module';

async function bootstrap() {
  // без http сервера
  await NestFactory.createApplicationContext(RunnerModule);
}
bootstrap();