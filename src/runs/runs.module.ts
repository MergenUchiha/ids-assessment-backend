import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'runs' })],
  controllers: [RunsController],
  providers: [RunsService],
})
export class RunsModule {}
