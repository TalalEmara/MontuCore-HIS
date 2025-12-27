/*
  Warnings:

  - You are about to drop the column `dicom_file_name` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `dicom_public_url` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `dicom_supabase_path` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `dicom_uploaded_at` on the `exams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "exams" DROP COLUMN "dicom_file_name",
DROP COLUMN "dicom_public_url",
DROP COLUMN "dicom_supabase_path",
DROP COLUMN "dicom_uploaded_at";

-- CreateTable
CREATE TABLE "pacs_images" (
    "id" SERIAL NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "supabase_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacs_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pacs_images" ADD CONSTRAINT "pacs_images_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
