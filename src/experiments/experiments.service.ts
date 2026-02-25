import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExperimentsService {
  constructor(private prisma: PrismaService) {}

  create(name: string, description?: string) {
    return this.prisma.experiment.create({
      data: { name, description },
    });
  }

  findAll() {
    return this.prisma.experiment.findMany({
      include: { runs: true },
    });
  }

  findOne(id: string) {
    return this.prisma.experiment.findUnique({
      where: { id },
      include: { runs: true },
    });
  }

  remove(id: string) {
    return this.prisma.experiment.delete({
      where: { id },
    });
  }
}
