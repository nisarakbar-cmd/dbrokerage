-- CreateEnum
CREATE TYPE "ListingAuditType" AS ENUM ('CREATED', 'UPDATED', 'PUBLISHED', 'UNPUBLISHED', 'TIER_CHANGED', 'VERIFICATION_UPDATED', 'AVAILABILITY_CHANGED', 'PRICE_CHANGED', 'ARCHIVED', 'RESTORED');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "verificationChecklist" JSONB;

-- CreateTable
CREATE TABLE "ListingAudit" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "type" "ListingAuditType" NOT NULL,
    "message" TEXT NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingAudit_listingId_idx" ON "ListingAudit"("listingId");

-- AddForeignKey
ALTER TABLE "ListingAudit" ADD CONSTRAINT "ListingAudit_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
