-- CreateTable
CREATE TABLE "JournalTopic" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "people" TEXT[],
    "places" TEXT[],
    "organizations" TEXT[],
    "things" TEXT[],
    "emotion" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "JournalTopic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JournalTopic" ADD CONSTRAINT "JournalTopic_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
