-- CreateTable
CREATE TABLE "ReadEntry" (
    "userId" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadEntry_pkey" PRIMARY KEY ("userId","journalEntryId")
);

-- AddForeignKey
ALTER TABLE "ReadEntry" ADD CONSTRAINT "ReadEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadEntry" ADD CONSTRAINT "ReadEntry_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
