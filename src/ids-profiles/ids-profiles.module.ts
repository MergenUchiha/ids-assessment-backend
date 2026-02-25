import { Module } from '@nestjs/common';
import { IdsProfilesService } from './ids-profiles.service';
import { IdsProfilesController } from './ids-profiles.controller';

@Module({
  controllers: [IdsProfilesController],
  providers: [IdsProfilesService],
})
export class IdsProfilesModule {}
