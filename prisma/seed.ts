import { PrismaClient, RunStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// ─── Metasploit модули — реальные auxiliary/exploit модули ──────────────────
const MSF_MODULES = [
  {
    module: 'auxiliary/scanner/http/http_version',
    rport: 80,
    sigs: ['ET SCAN Nmap Scripting Engine User-Agent Detected'],
  },
  {
    module: 'auxiliary/scanner/smb/smb_version',
    rport: 445,
    sigs: ['ET SCAN SMB Probe'],
  },
  {
    module: 'auxiliary/scanner/ftp/ftp_version',
    rport: 21,
    sigs: ['ET SCAN FTP Banner Retrieval'],
  },
  {
    module: 'auxiliary/scanner/ssh/ssh_version',
    rport: 22,
    sigs: ['ET SCAN Potential SSH Scan'],
  },
  {
    module: 'auxiliary/scanner/portscan/tcp',
    rport: 0,
    sigs: ['ET SCAN NMAP TCP'],
  },
  {
    module: 'auxiliary/scanner/http/dir_scanner',
    rport: 80,
    sigs: ['ET WEB_SERVER Directory Traversal'],
  },
  {
    module: 'exploit/unix/ftp/vsftpd_234_backdoor',
    rport: 21,
    sigs: ['ET EXPLOIT VSFTPD Backdoor'],
  },
  {
    module: 'exploit/multi/http/struts2_code_exec_classloader',
    rport: 8080,
    sigs: ['ET WEB_SPECIFIC_APPS Apache Struts RCE'],
  },
  {
    module: 'auxiliary/scanner/http/sqlmap',
    rport: 80,
    sigs: ['ET WEB_SPECIFIC_APPS SQL Injection Attempt'],
  },
  {
    module: 'exploit/windows/smb/ms17_010_eternalblue',
    rport: 445,
    sigs: ['ET EXPLOIT EternalBlue SMB Remote Windows Kernel Pool Corruption'],
  },
];

// ─── Suricata сигнатуры ──────────────────────────────────────────────────────
const SURICATA_SIGNATURES = [
  { sig: 'ET SCAN Nmap Scripting Engine User-Agent Detected', sev: 2 },
  { sig: 'ET SCAN Possible Nmap OS Detection', sev: 2 },
  { sig: 'ET SCAN NMAP TCP', sev: 2 },
  { sig: 'ET SCAN Potential SSH Scan OUTBOUND', sev: 2 },
  { sig: 'ET SCAN SMB Probe', sev: 2 },
  { sig: 'ET WEB_SERVER Directory Traversal Attempt', sev: 1 },
  { sig: 'ET WEB_SPECIFIC_APPS SQL Injection Attempt', sev: 1 },
  {
    sig: 'ET EXPLOIT EternalBlue SMB Remote Windows Kernel Pool Corruption',
    sev: 1,
  },
  { sig: 'ET EXPLOIT VSFTPD Backdoor User Login', sev: 1 },
  { sig: 'ET WEB_SPECIFIC_APPS Apache Struts RCE', sev: 1 },
  { sig: 'ET POLICY HTTP Request to .exe File', sev: 3 },
  { sig: 'ET TROJAN Generic - POST To gate.php', sev: 1 },
  { sig: 'ET INFO Possible Port Scan', sev: 3 },
  { sig: 'ET DOS Potential TCP Flood', sev: 2 },
  { sig: 'ET MALWARE Meterpreter Reverse Shell', sev: 1 },
];

// ─── Наборы правил Suricata ──────────────────────────────────────────────────
const RULESETS = [
  'default-suricata',
  'emerging-threats-open',
  'emerging-threats-pro',
  'snort-community',
  'pt-research-rules',
];

// ─── Вспомогалки ──────────────────────────────────────────────────────────────
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomIp() {
  return `${randomInt(10, 192)}.${randomInt(0, 254)}.${randomInt(0, 254)}.${randomInt(1, 254)}`;
}

function fakeRunDates(status: RunStatus): {
  startedAt: Date | null;
  finishedAt: Date | null;
} {
  if (status === 'QUEUED') return { startedAt: null, finishedAt: null };
  const start = faker.date.recent({ days: 30 });
  if (status === 'RUNNING') return { startedAt: start, finishedAt: null };
  const durationMs = randomInt(8_000, 90_000);
  return {
    startedAt: start,
    finishedAt: new Date(start.getTime() + durationMs),
  };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding database with rich fake data...\n');

  // ── Очистка (обратный порядок FK) ──────────────────────────────────────────
  console.log('🗑  Clearing existing data...');
  await prisma.metric.deleteMany();
  await prisma.attackEvent.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.run.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.idsProfile.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.user.deleteMany();

  // ── 1. Пользователи ─────────────────────────────────────────────────────────
  console.log('👤 Creating users...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: { email: 'admin@test.com', password: adminHash },
  });

  const extraUsers = await Promise.all(
    Array.from({ length: 3 }, async () => {
      const hash = await bcrypt.hash('password123', 10);
      return prisma.user.create({
        data: { email: faker.internet.email().toLowerCase(), password: hash },
      });
    }),
  );
  console.log(`   ✓ ${1 + extraUsers.length} users`);

  // ── 2. IDS Профили ──────────────────────────────────────────────────────────
  console.log('🛡  Creating IDS profiles...');
  const profiles = await Promise.all(
    RULESETS.map((ruleset, i) =>
      prisma.idsProfile.upsert({
        where: { name: i === 0 ? 'default' : ruleset },
        update: {},
        create: { name: i === 0 ? 'default' : ruleset, ruleset },
      }),
    ),
  );
  console.log(`   ✓ ${profiles.length} IDS profiles`);

  // ── 3. Сценарии ─────────────────────────────────────────────────────────────
  console.log('🎯 Creating scenarios...');
  const scenarios = await Promise.all(
    MSF_MODULES.map(({ module, rport, sigs }) => {
      const shortName = module
        .split('/')
        .pop()!
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return prisma.scenario.create({
        data: {
          name: shortName,
          description: faker.hacker.phrase(),
          msfModule: module,
          rport: rport || undefined,
          payload: module.startsWith('exploit')
            ? randomFrom([
                'windows/x64/meterpreter/reverse_tcp',
                'linux/x64/shell/reverse_tcp',
                'cmd/unix/reverse_bash',
              ])
            : undefined,
          expectedSignatures: sigs,
        },
      });
    }),
  );
  console.log(`   ✓ ${scenarios.length} scenarios`);

  // ── 4. Эксперименты + Runs + Алерты + Метрики ───────────────────────────────
  console.log('🧪 Creating experiments with runs...');

  const EXPERIMENT_CONFIGS = [
    {
      name: 'Baseline IDS Evaluation',
      description:
        'Initial calibration run — default Suricata rules against common scanners',
      runsCount: 8,
    },
    {
      name: 'Emerging Threats Benchmark',
      description:
        'Testing emerging-threats-open ruleset against 0-day simulations',
      runsCount: 6,
    },
    {
      name: 'EternalBlue Detection Study',
      description:
        'Focus on MS17-010 detection rate across different rule configurations',
      runsCount: 5,
    },
    {
      name: 'Web App Attack Coverage',
      description:
        'SQL injection, directory traversal and RCE scenarios against web targets',
      runsCount: 7,
    },
    {
      name: 'Network Scan Detection',
      description:
        'Evaluating scan detection: Nmap, SYN, UDP and service probes',
      runsCount: 10,
    },
    {
      name: 'Red Team Exercise Q1 2026',
      description: 'Simulated APT-style multi-stage attack chain',
      runsCount: 4,
    },
  ];

  let totalRuns = 0;
  let totalAlerts = 0;

  for (const cfg of EXPERIMENT_CONFIGS) {
    const experiment = await prisma.experiment.create({
      data: {
        name: cfg.name,
        description: cfg.description,
        createdAt: faker.date.recent({ days: 60 }),
      },
    });

    for (let i = 0; i < cfg.runsCount; i++) {
      // последние 2 эксперимента — всегда FINISHED, остальные — случайно
      const isLast = i >= cfg.runsCount - 2;
      const statusPool: RunStatus[] = isLast
        ? ['FINISHED', 'FINISHED', 'FINISHED']
        : [
            'FINISHED',
            'FINISHED',
            'FINISHED',
            'FINISHED',
            'FAILED',
            'QUEUED',
            'RUNNING',
          ];
      const status = randomFrom(statusPool);

      const scenario = randomFrom(scenarios);
      const idsProfile = randomFrom(profiles);
      const { startedAt, finishedAt } = fakeRunDates(status);
      const attackSuccess =
        status === 'FINISHED'
          ? faker.datatype.boolean({ probability: 0.55 })
          : null;

      const run = await prisma.run.create({
        data: {
          experimentId: experiment.id,
          scenarioId: scenario.id,
          idsProfileId: idsProfile.id,
          status,
          startedAt,
          finishedAt,
          attackSuccess: attackSuccess ?? undefined,
        },
      });

      // ── AttackEvents ────────────────────────────────────────────────────────
      if (startedAt) {
        await prisma.attackEvent.create({
          data: { runId: run.id, type: 'attack_start', timestamp: startedAt },
        });

        if (finishedAt) {
          await prisma.attackEvent.create({
            data: { runId: run.id, type: 'attack_end', timestamp: finishedAt },
          });

          if (status !== 'FAILED') {
            const evType = attackSuccess ? 'attack_success' : 'attack_fail';
            await prisma.attackEvent.create({
              data: {
                runId: run.id,
                type: evType,
                timestamp: new Date(
                  finishedAt.getTime() - randomInt(500, 3000),
                ),
                data: {
                  snippet: attackSuccess
                    ? `Meterpreter session 1 opened (${randomIp()}:4444 -> ${randomIp()}:${randomInt(1024, 65535)})`
                    : 'Auxiliary module execution completed',
                },
              },
            });
          } else {
            await prisma.attackEvent.create({
              data: {
                runId: run.id,
                type: 'error',
                data: {
                  message: randomFrom([
                    'Connection refused',
                    'Timeout after 30s',
                    'Target not vulnerable',
                    'Authentication failed',
                  ]),
                },
              },
            });
          }
        }
      }

      // ── Алерты (только для FINISHED/RUNNING) ───────────────────────────────
      if (status === 'FINISHED' || status === 'RUNNING') {
        const alertCount = randomInt(0, 12);
        const baseTime = startedAt ?? new Date();

        const expectedSigs = scenario.expectedSignatures as string[];
        const alertPool = [
          ...pickMultiple(SURICATA_SIGNATURES, randomInt(2, 5)),
          ...expectedSigs.map((s) => ({ sig: s, sev: 1 as number })),
        ];

        for (let a = 0; a < alertCount; a++) {
          const sigEntry = randomFrom(
            alertPool.length > 0 ? alertPool : SURICATA_SIGNATURES,
          );
          const alertTs = new Date(baseTime.getTime() + randomInt(1000, 25000));

          await prisma.alert.create({
            data: {
              runId: run.id,
              timestamp: alertTs,
              signature: sigEntry.sig,
              severity: sigEntry.sev,
              srcIp: randomIp(),
              destIp: randomFrom(['192.168.1.100', '10.0.0.50', '172.16.0.10']),
              raw: {
                event_type: 'alert',
                timestamp: alertTs.toISOString(),
                src_ip: randomIp(),
                dest_ip: randomFrom(['192.168.1.100', '10.0.0.50']),
                src_port: randomInt(1024, 65535),
                dest_port: scenario.rport ?? randomInt(80, 8080),
                proto: randomFrom(['TCP', 'UDP']),
                alert: {
                  signature: sigEntry.sig,
                  severity: sigEntry.sev,
                  category: 'Attempted Information Leak',
                },
              },
            },
          });
          totalAlerts++;
        }

        // ── Метрики ──────────────────────────────────────────────────────────
        if (status === 'FINISHED') {
          const tp = attackSuccess ? 1 : 0;
          const fp = attackSuccess ? 0 : Math.random() > 0.6 ? 1 : 0;
          const fn = attackSuccess && Math.random() > 0.7 ? 1 : 0;

          const precision =
            tp + fp > 0
              ? tp / (tp + fp)
              : Math.random() > 0.5
                ? parseFloat(
                    faker.number
                      .float({ min: 0.5, max: 1.0, fractionDigits: 3 })
                      .toString(),
                  )
                : 0;
          const recall =
            tp + fn > 0
              ? tp / (tp + fn)
              : Math.random() > 0.5
                ? parseFloat(
                    faker.number
                      .float({ min: 0.4, max: 1.0, fractionDigits: 3 })
                      .toString(),
                  )
                : 0;
          const f1 =
            precision + recall > 0
              ? (2 * precision * recall) / (precision + recall)
              : 0;
          const latencyMs = tp === 1 ? randomInt(50, 4500) : null;

          await prisma.metric.create({
            data: {
              runId: run.id,
              tp,
              fp,
              fn,
              precision,
              recall,
              f1,
              latencyMs,
            },
          });
        }
      }

      totalRuns++;
    }

    console.log(`   ✓ "${cfg.name}" — ${cfg.runsCount} runs`);
  }

  // ── Итог ─────────────────────────────────────────────────────────────────────
  console.log('\n✅ Seeding complete!');
  console.log(`   👤 Users:       ${1 + extraUsers.length}`);
  console.log(`   🛡  IDS Profiles: ${profiles.length}`);
  console.log(`   🎯 Scenarios:   ${scenarios.length}`);
  console.log(`   🧪 Experiments: ${EXPERIMENT_CONFIGS.length}`);
  console.log(`   ▶  Runs:        ${totalRuns}`);
  console.log(`   🔔 Alerts:      ${totalAlerts}`);
  console.log('\n📧 Admin login: admin@test.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
