-- AlterTable: Add DICOM columns to exams table
ALTER TABLE "exams" ADD COLUMN "dicom_file_name" TEXT;
ALTER TABLE "exams" ADD COLUMN "dicom_supabase_path" TEXT;
ALTER TABLE "exams" ADD COLUMN "dicom_public_url" TEXT;
ALTER TABLE "exams" ADD COLUMN "dicom_uploaded_at" TIMESTAMP(3);

-- Migrate data from pacs_images to exams (keeping only the first image per exam)
UPDATE "exams"
SET
  "dicom_file_name" = sub.file_name,
  "dicom_supabase_path" = sub.supabase_path,
  "dicom_public_url" = sub.public_url,
  "dicom_uploaded_at" = sub.uploaded_at
FROM (
  SELECT DISTINCT ON (exam_id)
    exam_id,
    file_name,
    supabase_path,
    public_url,
    uploaded_at
  FROM "pacs_images"
  ORDER BY exam_id, uploaded_at ASC
) AS sub
WHERE "exams".id = sub.exam_id;

-- DropTable: Remove pacs_images table
DROP TABLE "pacs_images";