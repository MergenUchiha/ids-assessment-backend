import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.alert.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }
}
