import { JournalEntry, StarredEntry } from '@prisma/client';

export type StarredEntryExt = StarredEntry & {
  journalEntry: JournalEntry;
};
