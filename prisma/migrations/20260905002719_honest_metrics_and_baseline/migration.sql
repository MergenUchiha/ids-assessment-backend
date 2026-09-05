/*
  Warnings:

  - You are about to drop the column `f1` on the `Metric` table. All the data in the column will be lost.
  - You are about to drop the column `precision` on the `Metric` table. All the data in the column will be lost.
  - You are about to drop the column `recall` on the `Metric` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Metric" DROP COLUMN "f1",
DROP COLUMN "precision",
DROP COLUMN "recall",
ADD COLUMN     "tn" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Run" ADD COLUMN     "detected" BOOLEAN,
ADD COLUMN     "isBaseline" BOOLEAN NOT NULL DEFAULT false;
