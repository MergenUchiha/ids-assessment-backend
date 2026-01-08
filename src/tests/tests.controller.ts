import { Controller, Get, Param } from '@nestjs/common';
import { TestsService } from './tests.service';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  async findAll() {
    return this.testsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
  }

  @Get(':id/results')
  async getResults(@Param('id') id: string) {
    return this.testsService.getResults(id);
  }
}