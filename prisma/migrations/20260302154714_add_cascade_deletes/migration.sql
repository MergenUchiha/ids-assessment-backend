-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_runId_fkey";

-- DropForeignKey
ALTER TABLE "AttackEvent" DROP CONSTRAINT "AttackEvent_runId_fkey";

-- DropForeignKey
ALTER TABLE "Metric" DROP CONSTRAINT "Metric_runId_fkey";

-- DropForeignKey
ALTER TABLE "Run" DROP CONSTRAINT "Run_experimentId_fkey";

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttackEvent" ADD CONSTRAINT "AttackEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
