import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { RunsModule } from './runs/runs.module';
import { IdsProfilesModule } from './ids-profiles/ids-profiles.module';
import { ExperimentsModule } from './experiments/experiments.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    QueueModule,
    RunsModule,
    ExperimentsModule,
    ScenariosModule,
    IdsProfilesModule,
    AlertsModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
