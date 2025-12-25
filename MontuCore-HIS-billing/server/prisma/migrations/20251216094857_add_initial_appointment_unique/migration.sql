/*
  Warnings:

  - You are about to drop the column `appointment_id` on the `cases` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[initial_appointment_id]` on the table `cases` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "cases" DROP CONSTRAINT "cases_appointment_id_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "case_id" INTEGER;

-- AlterTable
ALTER TABLE "cases" DROP COLUMN "appointment_id",
ADD COLUMN     "initial_appointment_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "cases_initial_appointment_id_key" ON "cases"("initial_appointment_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_initial_appointment_id_fkey" FOREIGN KEY ("initial_appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
