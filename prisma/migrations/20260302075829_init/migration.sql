/*
  Warnings:

  - A unique constraint covering the columns `[qrToken]` on the table `Desk` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "maxDesks" DROP NOT NULL,
ALTER COLUMN "maxUsers" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Desk_qrToken_key" ON "Desk"("qrToken");

-- CreateIndex
CREATE INDEX "Reservation_companyId_idx" ON "Reservation"("companyId");

-- CreateIndex
CREATE INDEX "Reservation_companyId_date_idx" ON "Reservation"("companyId", "date");

-- CreateIndex
CREATE INDEX "Reservation_companyId_status_idx" ON "Reservation"("companyId", "status");
