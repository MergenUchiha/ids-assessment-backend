import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { IdsProfilesService } from './ids-profiles.service';

@Controller('ids-profiles')
export class IdsProfilesController {
  constructor(private readonly service: IdsProfilesService) {}

  @Post()
  create(@Body() body: { name: string; ruleset: string }) {
    return this.service.create(body.name, body.ruleset);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
