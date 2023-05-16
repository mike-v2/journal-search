import { journalDateToISOString } from "@/utils/convertDate";
import { JournalEntry } from "@prisma/client";
import useSWR from "swr";

export default function CreateData() {
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();

    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return data;
    }
  }

  const { data: entries1948, error } = useSWR('/api/entriesData', fetcher);
  if (error) {
    console.log(error);
  }

  async function handleCreatePrismaData() {
    console.log("Creating data...");
    let count = 0;

    for (let i = 0; i < entries1948.length; i++) {
      //get journal entry id
      const dateISO = journalDateToISOString(entries1948[i].date);
      try {
        const res = await fetch(`/api/journalEntry?date=${dateISO}`, {
          method: 'GET',
        });

        const entry = await res.json() as JournalEntry;
        if (entry) {
          const data = {
            journalEntryId: entry.id,
            name: entries1948[i].topic,
            summary: entries1948[i].summary,
            people: entries1948[i].people,
            places: entries1948[i].places,
            organizations: entries1948[i].organizations,
            things: entries1948[i].things,
            emotion: entries1948[i].emotion,
            mood: entries1948[i].mood,
            strength: entries1948[i].strength,
          }

          const response = await fetch(`/api/createPrismaData`, {
            method: "POST",
            body: JSON.stringify(data),
          });
          count++;
        } else {
          console.log("Could not find journal entry by date");
        }
      } catch (error) {
        console.log("Could not find journal entry by date: " + error);
      }
    }

    console.log(`Finished sending ${count} journal topics`);
  }

  return (
    <div>
      <button onClick={handleCreatePrismaData}>Create Data</button>
    </div>
  )
}