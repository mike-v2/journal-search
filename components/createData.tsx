import { journalDateToISOString } from "@/utils/convertDate";
import { JournalEntry } from "@prisma/client";

export default function CreateData() {

  async function loadLocalData() {
    console.log("Loading local data...")
    try {
      const res = await fetch('/api/entriesData');
      const data = await res.json();

      if (data) {
        return JSON.parse(data);
      }

    } catch (error) {
      console.error("Failed to fetch local data ", error);
    }
  }

  async function handleCreatePrismaData() {
    /* const data = await loadLocalData();
    if (!data) {
      console.log("could not find local data");
      return;
    } */
    console.log("Updating Supabase data...");


    try {
      const newEntry = {
        date: new Date('1947-05-02'),
        startPage: '20',
        endPage: '21',
        content: "I am counting the days until we leave on our honeymoon trip. 90 more days. Laip Mama got her first paycheck yesterday. The amount was good. Sonny presumably went to work today watering at the city cemetery. He is in good physical condition. Betty Lou left this morning for Corpus Christi, Texas to work. I hope she doesn't marry that Smitty fellow. I don't think he is any good. He is the attraction that took her back down there. I disliked seeing her go, but she is far away and 23 yesterday, so I guess she can do as she pleases.",
      }
      const response = await fetch(`/api/createPrismaData`, {
        method: "POST",
        body: JSON.stringify(newEntry),
      });
    } catch (error) {
      console.error("Could not post to supabase", error);
    }
/* 
    let count = 0;

    for (let i = 0; i < data.length; i++) {
      try {
        const newEntry = {
          date: new Date(data[i].date),
          startPage: data[i].startPage,
          endPage: data[i].endPage,
          content: data[i].content

        const response = await fetch(`/api/createPrismaData`, {
          method: "POST",
          body: JSON.stringify(newEntry),
        });
      } catch (error) {
        console.error("Could not post to supabase", error);
      }
    }
    */


    //add journal topic, get journalEntryId first to add to topic data

    /* for (let i = 0; i < data.length; i++) {
      const dateISO = new Date(data[i].date).toISOString();

      try {
        const res = await fetch(`/api/journalEntry?date=${dateISO}`, {
          method: 'GET',
        });

        const entry = await res.json() as JournalEntry;
        if (entry) {
          const newEntry = {
            journalEntryId: entry.id,
            name: data[i].topic,
            summary: data[i].summary,
            text: data[i].text,
            people: data[i].people,
            places: data[i].places,
            organizations: data[i].organizations,
            things: data[i].things,
            emotion: data[i].emotion,
            mood: data[i].mood,
            strength: data[i].strength,
          }

          const response = await fetch(`/api/createPrismaData`, {
            method: "POST",
            body: JSON.stringify(newEntry),
          });
          count++;
        } else {
          console.log("Could not find journal entry by date");
        }
      } catch (error) {
        console.log("Could not find journal entry by date: " + error);
      }
    } 


    console.log(`Finished sending ${count} journal entries`); */
  }

  return (
    <div>
      <button onClick={handleCreatePrismaData}>Create Data</button>
    </div>
  )
}