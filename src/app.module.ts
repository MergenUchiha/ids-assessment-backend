import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { TestsModule } from './tests/tests.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LabModule } from './lab/lab.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ScenariosModule,
    TestsModule,
    DashboardModule,
    LabModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}