import { JournalEntry, StarredEntry } from "@prisma/client";

export default interface StarredEntryExt extends StarredEntry {
  journalEntry: JournalEntry
}
