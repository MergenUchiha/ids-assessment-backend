import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { RunsProcessor } from './runs.processor';
import { DockerExecService } from './lab/docker-exec.service';
import { EveJsonReader } from './lab/eve-json.reader';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    QueueModule,
  ],
  providers: [RunsProcessor, DockerExecService, EveJsonReader],
})
export class RunnerModule {}
