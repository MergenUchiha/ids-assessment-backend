import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LabService {
  constructor(private prisma: PrismaService) {}

  async getEnvironments() {
    let environments = await this.prisma.labEnvironment.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // If no environments exist, create default ones
    if (environments.length === 0) {
      await this.createDefaultEnvironments();
      environments = await this.prisma.labEnvironment.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    // Simulate resource usage updates
    return environments.map((env) => ({
      ...env,
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 100,
    }));
  }

  async getIDSConfigs() {
    let configs = await this.prisma.iDSConfiguration.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // If no configs exist, create default ones
    if (configs.length === 0) {
      await this.createDefaultIDSConfigs();
      configs = await this.prisma.iDSConfiguration.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    return configs;
  }

  private async createDefaultEnvironments() {
    await this.prisma.labEnvironment.createMany({
      data: [
        {
          name: 'Kali Attacker',
          type: 'attacker',
          ip: '192.168.1.50',
          os: 'Kali Linux 2023.4',
          status: 'online',
          cpu: 45,
          memory: 62,
          network: 78,
        },
        {
          name: 'Windows Target',
          type: 'target',
          ip: '192.168.1.100',
          os: 'Windows Server 2008 R2',
          status: 'busy',
          cpu: 89,
          memory: 71,
          network: 92,
        },
        {
          name: 'IDS Sensor',
          type: 'ids',
          ip: '192.168.1.10',
          os: 'Ubuntu 22.04',
          status: 'online',
          cpu: 34,
          memory: 48,
          network: 65,
        },
      ],
    });
  }

  private async createDefaultIDSConfigs() {
    await this.prisma.iDSConfiguration.createMany({
      data: [
        {
          name: 'Snort Primary',
          type: 'snort',
          version: '3.1.70.0',
          rules: 45234,
          sensitivity: 'high',
          status: 'active',
        },
        {
          name: 'Suricata Backup',
          type: 'suricata',
          version: '7.0.2',
          rules: 38921,
          sensitivity: 'medium',
          status: 'inactive',
        },
      ],
    });
  }
}