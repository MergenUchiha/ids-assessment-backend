import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ScenariosService } from './scenarios.service';

@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly service: ScenariosService) {}

  @Post()
  create(
    @Body()
    body: {
      name: string;
      description?: string;
      msfModule: string;
      payload?: string;
      rport?: number;
      expectedSignatures?: string[];
    },
  ) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
