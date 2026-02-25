import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdsProfilesService {
  constructor(private prisma: PrismaService) {}

  create(name: string, ruleset: string) {
    return this.prisma.idsProfile.create({
      data: { name, ruleset },
    });
  }

  findAll() {
    return this.prisma.idsProfile.findMany();
  }

  remove(id: string) {
    return this.prisma.idsProfile.delete({
      where: { id },
    });
  }
}
