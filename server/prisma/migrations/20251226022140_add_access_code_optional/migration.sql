-- AlterTable
ALTER TABLE "consultation_shares" ADD COLUMN     "access_code" TEXT,
ALTER COLUMN "external_email" DROP NOT NULL;
