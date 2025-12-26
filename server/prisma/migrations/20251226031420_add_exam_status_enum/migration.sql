/*
  Warnings:

  - Changed the type of `status` on the `exams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('ORDERED', 'COMPLETED', 'CANCELLED');

-- AlterTable
-- First, update existing data to valid enum values
UPDATE "exams" SET "status" = 'COMPLETED' WHERE "status" = 'IMAGING_COMPLETE';
-- Any other invalid statuses will be set to ORDERED by default

-- Change column type to enum (PostgreSQL handles this)
ALTER TABLE "exams" ALTER COLUMN "status" TYPE "ExamStatus" USING "status"::"ExamStatus";
