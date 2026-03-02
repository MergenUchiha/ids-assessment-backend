// src/ids-profiles/ids-profiles.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdsProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, ruleset: string) {
    const existing = await this.prisma.idsProfile.findUnique({
      where: { name },
    });
    if (existing)
      throw new ConflictException(`Profile "${name}" already exists`);
    return this.prisma.idsProfile.create({ data: { name, ruleset } });
  }

  findAll() {
    return this.prisma.idsProfile.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async remove(id: string) {
    // Обнуляем idsProfileId у runs перед удалением
    await this.prisma.run.updateMany({
      where: { idsProfileId: id },
      data: { idsProfileId: null },
    });
    return this.prisma.idsProfile.delete({ where: { id } });
  }
}
