-- AlterTable
ALTER TABLE "OtpChallenge" ADD COLUMN     "ip" TEXT;

-- CreateIndex
CREATE INDEX "OtpChallenge_ip_idx" ON "OtpChallenge"("ip");
