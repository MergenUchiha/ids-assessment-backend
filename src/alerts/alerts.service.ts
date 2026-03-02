// src/alerts/alerts.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    // Лимит 500 — для глобальной страницы алертов этого достаточно
    // В production стоит добавить пагинацию
    return this.prisma.alert.findMany({
      orderBy: { timestamp: 'desc' },
      take: 500,
      include: {
        run: {
          select: {
            id: true,
            experimentId: true,
            scenario: { select: { name: true } },
          },
        },
      },
    });
  }
}
