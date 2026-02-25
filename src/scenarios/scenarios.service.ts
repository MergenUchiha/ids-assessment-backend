import { Injectable } from '@nestjs/common';
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
    return this.prisma.scenario.create({
      data,
    });
  }

  findAll() {
    return this.prisma.scenario.findMany();
  }

  findOne(id: string) {
    return this.prisma.scenario.findUnique({
      where: { id },
    });
  }

  remove(id: string) {
    return this.prisma.scenario.delete({
      where: { id },
    });
  }
}
