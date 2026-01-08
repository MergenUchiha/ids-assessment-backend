import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScenarioDto, UpdateScenarioDto } from './dto/scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.attackScenario.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tests: {
          take: 5,
          orderBy: { startedAt: 'desc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const scenario = await this.prisma.attackScenario.findUnique({
      where: { id },
      include: {
        tests: {
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!scenario) {
      throw new NotFoundException(`Scenario with ID ${id} not found`);
    }

    return scenario;
  }

  async create(data: CreateScenarioDto) {
    return this.prisma.attackScenario.create({
      data: {
        name: data.name,
        description: data.description,
        exploitType: data.exploitType,
        targetIP: data.targetIP,
        targetOS: data.targetOS,
        targetPort: data.targetPort,
        status: data.status || 'draft',
      },
    });
  }

  async update(id: string, data: UpdateScenarioDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.attackScenario.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.attackScenario.delete({
      where: { id },
    });
  }

  async runScenario(id: string) {
    const scenario = await this.findOne(id);

    // Update scenario status to running
    await this.prisma.attackScenario.update({
      where: { id },
      data: { status: 'running' },
    });

    // Create a new test
    const test = await this.prisma.test.create({
      data: {
        scenarioId: id,
        status: 'running',
        totalAttacks: 0,
        detectedAttacks: 0,
        missedAttacks: 0,
        falsePositives: 0,
      },
    });

    // Simulate test execution (in real app, this would trigger Metasploit)
    this.simulateTest(test.id, id);

    return {
      message: 'Test started successfully',
      testId: test.id,
      scenarioName: scenario.name,
    };
  }

  private async simulateTest(testId: string, scenarioId: string) {
    // Simulate test duration (5 seconds)
    setTimeout(async () => {
      const totalAttacks = Math.floor(Math.random() * 30) + 20;
      const detectedAttacks = Math.floor(totalAttacks * (0.85 + Math.random() * 0.1));
      const missedAttacks = totalAttacks - detectedAttacks;
      const falsePositives = Math.floor(Math.random() * 3);

      // Generate test results
      for (let i = 0; i < totalAttacks; i++) {
        await this.prisma.testResult.create({
          data: {
            testId,
            attackType: ['RCE', 'SQLi', 'XSS', 'Buffer Overflow'][Math.floor(Math.random() * 4)],
            exploitName: ['MS17-010', 'CVE-2021-44228', 'CVE-2014-6271'][Math.floor(Math.random() * 3)],
            idsDetected: i < detectedAttacks,
            detectionTime: i < detectedAttacks ? Math.floor(Math.random() * 5000) : null,
            falsePositive: Math.random() > 0.95,
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
            sourceIP: '192.168.1.50',
            targetIP: '192.168.1.100',
            protocol: ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)],
          },
        });
      }

      // Update test status
      await this.prisma.test.update({
        where: { id: testId },
        data: {
          status: 'completed',
          finishedAt: new Date(),
          totalAttacks,
          detectedAttacks,
          missedAttacks,
          falsePositives,
        },
      });

      // Update scenario status
      await this.prisma.attackScenario.update({
        where: { id: scenarioId },
        data: { status: 'completed' },
      });

      console.log(`✅ Test ${testId} completed`);
    }, 5000);
  }
}