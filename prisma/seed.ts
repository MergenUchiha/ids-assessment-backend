import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.testResult.deleteMany();
  await prisma.test.deleteMany();
  await prisma.attackScenario.deleteMany();
  await prisma.labEnvironment.deleteMany();
  await prisma.iDSConfiguration.deleteMany();
  await prisma.report.deleteMany();

  // Create Attack Scenarios
  const scenario1 = await prisma.attackScenario.create({
    data: {
      name: 'EternalBlue (MS17-010)',
      description: 'SMB exploit targeting Windows systems',
      exploitType: 'Remote Code Execution',
      targetIP: '192.168.1.100',
      targetOS: 'Windows Server 2008 R2',
      targetPort: 445,
      status: 'ready',
    },
  });

  const scenario2 = await prisma.attackScenario.create({
    data: {
      name: 'Log4Shell (CVE-2021-44228)',
      description: 'JNDI injection vulnerability in Log4j',
      exploitType: 'Remote Code Execution',
      targetIP: '192.168.1.101',
      targetOS: 'Ubuntu 20.04',
      targetPort: 8080,
      status: 'completed',
    },
  });

  const scenario3 = await prisma.attackScenario.create({
    data: {
      name: 'Shellshock (CVE-2014-6271)',
      description: 'Bash environment variable command injection',
      exploitType: 'Command Injection',
      targetIP: '192.168.1.102',
      targetOS: 'Debian 7',
      targetPort: 80,
      status: 'draft',
    },
  });

  // Create Tests
  const test1 = await prisma.test.create({
    data: {
      scenarioId: scenario1.id,
      status: 'completed',
      startedAt: new Date(Date.now() - 3600000),
      finishedAt: new Date(),
      totalAttacks: 50,
      detectedAttacks: 47,
      missedAttacks: 3,
      falsePositives: 2,
    },
  });

  const test2 = await prisma.test.create({
    data: {
      scenarioId: scenario2.id,
      status: 'completed',
      startedAt: new Date(Date.now() - 7200000),
      finishedAt: new Date(Date.now() - 3600000),
      totalAttacks: 35,
      detectedAttacks: 32,
      missedAttacks: 3,
      falsePositives: 1,
    },
  });

  // Create Test Results for test1
  const attackTypes = ['RCE', 'SQLi', 'XSS', 'CSRF'];
  const exploits = ['MS17-010', 'CVE-2021-44228', 'CVE-2014-6271'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const protocols = ['TCP', 'UDP', 'ICMP'];

  for (let i = 0; i < 50; i++) {
    await prisma.testResult.create({
      data: {
        testId: test1.id,
        attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        exploitName: exploits[Math.floor(Math.random() * exploits.length)],
        idsDetected: Math.random() > 0.1,
        detectionTime: Math.random() > 0.1 ? Math.floor(Math.random() * 5000) : null,
        falsePositive: Math.random() > 0.95,
        severity: severities[Math.floor(Math.random() * severities.length)],
        sourceIP: '192.168.1.50',
        targetIP: '192.168.1.100',
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000),
      },
    });
  }

  // Create Lab Environments
  await prisma.labEnvironment.createMany({
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

  // Create IDS Configurations
  await prisma.iDSConfiguration.createMany({
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

  // Create Reports
  await prisma.report.createMany({
    data: [
      {
        name: 'December 2024 Summary Report',
        type: 'summary',
        format: 'pdf',
        dateRange: '30',
        testsIncluded: 47,
        fileSize: '2.3 MB',
        filePath: '/reports/1234567890.pdf',
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        name: 'EternalBlue Detailed Analysis',
        type: 'detailed',
        format: 'pdf',
        dateRange: '7',
        testsIncluded: 12,
        fileSize: '4.1 MB',
        filePath: '/reports/1234567891.pdf',
        createdAt: new Date(Date.now() - 86400000 * 10),
      },
    ],
  });

  console.log('✅ Database seeded successfully');
  console.log(`   - ${3} attack scenarios created`);
  console.log(`   - ${2} tests created`);
  console.log(`   - ${50} test results created`);
  console.log(`   - ${3} lab environments created`);
  console.log(`   - ${2} IDS configurations created`);
  console.log(`   - ${2} reports created`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });