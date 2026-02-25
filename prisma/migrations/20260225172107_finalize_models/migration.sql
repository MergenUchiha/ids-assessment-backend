-- AlterTable
ALTER TABLE "Metric" ADD COLUMN     "fn" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tp" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Run" ADD COLUMN     "evePath" TEXT,
ADD COLUMN     "idsProfileId" TEXT,
ADD COLUMN     "msfLogPath" TEXT;

-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "expectedSignatures" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "IdsProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ruleset" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdsProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttackEvent" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB,

    CONSTRAINT "AttackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdsProfile_name_key" ON "IdsProfile"("name");

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_idsProfileId_fkey" FOREIGN KEY ("idsProfileId") REFERENCES "IdsProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttackEvent" ADD CONSTRAINT "AttackEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
