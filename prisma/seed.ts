import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- USER ---
  const passwordHash = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: passwordHash,
    },
  });

  console.log('👤 Admin user ready:', user.email);

  // --- IDS PROFILE ---
  const profile = await prisma.idsProfile.upsert({
    where: { name: 'default' },
    update: {},
    create: {
      name: 'default',
      ruleset: 'default-suricata',
    },
  });

  console.log('🛡 IDS Profile ready:', profile.name);

  // --- SCENARIO ---
  const scenario = await prisma.scenario.create({
    data: {
      name: 'HTTP Version Scan',
      description: 'Auxiliary HTTP version scanner',
      msfModule: 'auxiliary/scanner/http/http_version',
      rport: 80,
      expectedSignatures: [],
    },
  });

  console.log('🎯 Scenario created:', scenario.name);

  // --- EXPERIMENT ---
  const experiment = await prisma.experiment.create({
    data: {
      name: 'Baseline Experiment',
      description: 'Default experiment for IDS evaluation',
    },
  });

  console.log('🧪 Experiment created:', experiment.name);

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });