// src/scenarios/scenarios.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    name: string;
    description?: string;
    msfModule: string;
    payload?: string;
    rport?: number;
    expectedSignatures?: string[];
  }) {
    return this.prisma.scenario.create({ data });
  }

  findAll() {
    return this.prisma.scenario.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const scenario = await this.prisma.scenario.findUnique({ where: { id } });
    if (!scenario) throw new NotFoundException(`Scenario ${id} not found`);
    return scenario;
  }

  /**
   * Нельзя удалить scenario если на него ссылаются runs.
   * Обнуляем scenarioId у runs перед удалением.
   */
  async remove(id: string) {
    await this.prisma.run.updateMany({
      where: { scenarioId: id },
      data: { scenarioId: null },
    });
    return this.prisma.scenario.delete({ where: { id } });
  }
}
