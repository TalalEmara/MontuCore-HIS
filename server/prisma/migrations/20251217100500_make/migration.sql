/*
  Warnings:

  - Made the column `initial_appointment_id` on table `cases` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_case_id_fkey";

-- DropForeignKey
ALTER TABLE "cases" DROP CONSTRAINT "cases_initial_appointment_id_fkey";

-- AlterTable
ALTER TABLE "cases" ALTER COLUMN "initial_appointment_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_initial_appointment_id_fkey" FOREIGN KEY ("initial_appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
