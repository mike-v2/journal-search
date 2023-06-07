import { JournalEntry } from "@prisma/client";
import { journalDateToISOString } from "./convertDate";

export default async function fetchJournalEntryByDate(journalDate: string): Promise<JournalEntry | undefined> {
    const dateISO = journalDateToISOString(journalDate);

    try {
        const res = await fetch(`/api/journalEntry?date=${dateISO}`, {
            method: 'GET',
        });

        if (res.status === 200) {
            const entry = await res.json() as JournalEntry;
            if (entry) {
                return entry;
            }
        } else if (res.status === 500) {
            const data = await res.json();
            console.log(data.error);
        } else {
            console.log("Could not find journal entry by date");
        }
    } catch (error) {
        console.log("Could not find journal entry by date: " + error);
    }

    return undefined;
}