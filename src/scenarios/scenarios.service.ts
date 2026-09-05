// src/scenarios/scenarios.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScenarioDto } from './dto/scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateScenarioDto) {
    return this.prisma.scenario.create({
      data: { ...data, expectedSignatures: data.expectedSignatures ?? [] },
    });
  }

  findAll() {
    return this.prisma.scenario.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const scenario = await this.prisma.scenario.findUnique({ where: { id } });
    if (!scenario) throw new NotFoundException(`Scenario ${id} not found`);
    return scenario;
  }

  // Runs reference a scenario with `onDelete: SetNull`, so deleting one leaves
  // its runs intact with a null scenarioId.
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.scenario.delete({ where: { id } });
  }
}
