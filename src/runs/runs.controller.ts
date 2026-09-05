import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RunsService } from './runs.service';
import { CreateRunDto } from './dto/create-run.dto';

@ApiTags('runs')
@ApiBearerAuth()
@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post(':experimentId/:scenarioId')
  create(
    @Param('experimentId') experimentId: string,
    @Param('scenarioId') scenarioId: string,
    @Body() dto: CreateRunDto,
  ) {
    return this.runsService.createRun(
      experimentId,
      scenarioId,
      dto.isBaseline ?? false,
    );
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
  alerts(
    @Param('runId') runId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    // `Number('abc')` is NaN, which slipped through as a page number before.
    const pageNum = Number(page);
    const limitNum = Number(limit);
    if (!Number.isInteger(pageNum) || !Number.isInteger(limitNum)) {
      throw new BadRequestException('page and limit must be integers');
    }
    return this.runsService.getAlerts(runId, pageNum, limitNum);
  }
}
