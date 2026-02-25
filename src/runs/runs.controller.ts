import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RunsService } from './runs.service';

@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post(':experimentId/:scenarioId')
  create(
    @Param('experimentId') experimentId: string,
    @Param('scenarioId') scenarioId: string,
  ) {
    return this.runsService.createRun(experimentId, scenarioId);
  }

  @Get(':runId')
  get(@Param('runId') runId: string) {
    return this.runsService.getRun(runId);
  }

  @Get(':runId/report')
  report(@Param('runId') runId: string) {
    return this.runsService.getReport(runId);
  }

  @Get(':runId/alerts')
  async alerts(
    @Param('runId') runId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.runsService.getAlerts(runId, Number(page), Number(limit));
  }
}
