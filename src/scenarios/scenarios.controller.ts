import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { CreateScenarioDto, UpdateScenarioDto } from './dto/scenario.dto';

@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    return this.scenariosService.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.scenariosService.findOne(id);
  }

  @Post()
  async create(@Body() createScenarioDto: CreateScenarioDto) {
    return this.scenariosService.create(createScenarioDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateScenarioDto: UpdateScenarioDto) {
    return this.scenariosService.update(id, updateScenarioDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.scenariosService.remove(id);
  }

  @Post(':id/run')
  async runScenario(@Param('id') id: string) {
    return this.scenariosService.runScenario(id);
  }
}