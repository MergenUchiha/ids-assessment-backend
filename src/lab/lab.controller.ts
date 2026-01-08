import { Controller, Get } from '@nestjs/common';
import { LabService } from './lab.service';

@Controller('lab')
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Get('environments')
  async getEnvironments() {
    return this.labService.getEnvironments();
  }

  @Get('ids-configs')
  async getIDSConfigs() {
    return this.labService.getIDSConfigs();
  }
}