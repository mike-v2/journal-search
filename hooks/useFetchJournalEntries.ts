import { journalDateToISOString } from "@/utils/convertDate";
import { JournalEntry } from "@prisma/client";
import { useEffect, useState } from "react";

type ExampleEntry = {
  header: string,
  entryDate: string,
  entry?: JournalEntry,
  imagePath: string,
}

export default function useFetchJournalEntries(initialEntries: ExampleEntry[]) {
  const [entries, setEntries] = useState(initialEntries);

  useEffect(() => {
    const fetchJournalEntryByDate = async (journalDate: string) => {
      const dateISO = journalDateToISOString(journalDate);

      try {
        const res = await fetch(`/api/journalEntry?date=${dateISO}`, {
          method: 'GET',
        });

        if (res.ok) {
          const entry = await res.json();
          return entry;
        }
      } catch (error) {
        console.log("Could not find journal entry by date: " + error);
      }

      return undefined;
    }

    const fetchEntries = async () => {
      console.log(`fetching ${initialEntries.length} entries`)
      const fetchedEntries = await Promise.all(
        initialEntries.map(async (entry) => ({
          ...entry,
          entry: await fetchJournalEntryByDate(entry.entryDate),
        })),
      );

      console.log("setting entries::");
      console.log(fetchedEntries);
      setEntries(fetchedEntries);
    };

    fetchEntries();
  }, []);

  return entries;
}