import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  // Nest's own lifecycle hook replaces the hand-rolled `process.on('beforeExit')`
  // shutdown handler, which Prisma 5 no longer supports through $on('beforeExit').
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
