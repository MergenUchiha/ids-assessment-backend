-- CreateTable
CREATE TABLE "attack_scenarios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exploitType" TEXT NOT NULL,
    "targetIP" TEXT NOT NULL,
    "targetOS" TEXT NOT NULL,
    "targetPort" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',

    CONSTRAINT "attack_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "totalAttacks" INTEGER NOT NULL DEFAULT 0,
    "detectedAttacks" INTEGER NOT NULL DEFAULT 0,
    "missedAttacks" INTEGER NOT NULL DEFAULT 0,
    "falsePositives" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "attackType" TEXT NOT NULL,
    "exploitName" TEXT NOT NULL,
    "idsDetected" BOOLEAN NOT NULL,
    "detectionTime" INTEGER,
    "falsePositive" BOOLEAN NOT NULL DEFAULT false,
    "severity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceIP" TEXT NOT NULL,
    "targetIP" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ids_configurations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "rules" INTEGER NOT NULL,
    "sensitivity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ids_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_environments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "cpu" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "memory" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "network" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_environments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "dateRange" TEXT NOT NULL,
    "testsIncluded" INTEGER NOT NULL DEFAULT 0,
    "fileSize" TEXT,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lab_environments_ip_key" ON "lab_environments"("ip");

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "attack_scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
