/*
  Warnings:

  - You are about to drop the column `external_email` on the `consultation_shares` table. All the data in the column will be lost.
  - Made the column `access_code` on table `consultation_shares` required. This step will fail if there are existing NULL values in that column.

*/
-- Delete existing consultation shares since we're changing the system from email-based to access-code-based
DELETE FROM "consultation_shares";

-- AlterTable
ALTER TABLE "consultation_shares" DROP COLUMN "external_email",
ALTER COLUMN "access_code" SET NOT NULL;
