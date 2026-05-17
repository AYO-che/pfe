/*
  Warnings:

  - The values [CONSULTATION] on the enum `OfferType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `includesChat` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `includesPlan` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `includesSessions` on the `Offer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ClientPostType" AS ENUM ('RECIPE', 'EXPERIENCE', 'BEFORE_AFTER');

-- AlterEnum
BEGIN;
CREATE TYPE "OfferType_new" AS ENUM ('AI_CALORIES', 'PLAN', 'PACKAGE');
ALTER TABLE "public"."Resume" ALTER COLUMN "offersTypes" DROP DEFAULT;
ALTER TABLE "Resume" ALTER COLUMN "offersTypes" TYPE "OfferType_new"[] USING ("offersTypes"::text::"OfferType_new"[]);
ALTER TABLE "Offer" ALTER COLUMN "type" TYPE "OfferType_new" USING ("type"::text::"OfferType_new");
ALTER TYPE "OfferType" RENAME TO "OfferType_old";
ALTER TYPE "OfferType_new" RENAME TO "OfferType";
DROP TYPE "public"."OfferType_old";
ALTER TABLE "Resume" ALTER COLUMN "offersTypes" SET DEFAULT ARRAY[]::"OfferType"[];
COMMIT;

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "includesChat",
DROP COLUMN "includesPlan",
DROP COLUMN "includesSessions";

-- CreateTable
CREATE TABLE "ClientPost" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "type" "ClientPostType" NOT NULL DEFAULT 'EXPERIENCE',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "likes" INTEGER NOT NULL DEFAULT 0,
    "status" "PostStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClientPost" ADD CONSTRAINT "ClientPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
