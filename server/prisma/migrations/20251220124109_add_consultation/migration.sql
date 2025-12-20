-- CreateTable
CREATE TABLE "consultation_shares" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "external_email" TEXT NOT NULL,
    "clinician_id" INTEGER NOT NULL,
    "athlete_id" INTEGER NOT NULL,
    "permissions" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessed_at" TIMESTAMP(3),

    CONSTRAINT "consultation_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consultation_shares_token_key" ON "consultation_shares"("token");

-- AddForeignKey
ALTER TABLE "consultation_shares" ADD CONSTRAINT "consultation_shares_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_shares" ADD CONSTRAINT "consultation_shares_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
