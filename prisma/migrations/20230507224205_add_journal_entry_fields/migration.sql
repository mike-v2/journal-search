/*
  Warnings:

  - You are about to drop the column `createdAt` on the `JournalEntry` table. All the data in the column will be lost.
  - Added the required column `date` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endPage` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startPage` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "createdAt",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "endPage" TEXT NOT NULL,
ADD COLUMN     "startPage" TEXT NOT NULL;
