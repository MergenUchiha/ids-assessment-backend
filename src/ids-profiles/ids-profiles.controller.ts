import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IdsProfilesService } from './ids-profiles.service';
import { CreateIdsProfileDto } from './dto/ids-profile.dto';

@ApiTags('ids-profiles')
@ApiBearerAuth()
@Controller('ids-profiles')
export class IdsProfilesController {
  constructor(private readonly service: IdsProfilesService) {}

  @Post()
  create(@Body() dto: CreateIdsProfileDto) {
    return this.service.create(dto.name, dto.ruleset);
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
