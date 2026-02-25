import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        redis: {
          host: cfg.get<string>('REDIS_HOST', 'localhost'),
          port: Number(cfg.get<string>('REDIS_PORT', '6379')),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'runs' }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
