import { Controller, Get, Put, Param, Body } from '@nestjs/common';
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

  @Put('ids-configs/:id/status')
  async updateIDSStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.labService.updateIDSStatus(id, body.status);
  }

  @Put('ids-configs/:id/rules')
  async updateIDSRules(
    @Param('id') id: string,
    @Body() body: { rules: number },
  ) {
    return this.labService.updateIDSRules(id, body.rules);
  }
}