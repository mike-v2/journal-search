import JournalEntryBox from "@/components/journalEntryBox";
import { JournalEntry, StarredEntry } from "@prisma/client"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"

type StarredEntryExt = StarredEntry & { journalEntry: JournalEntry };

export default function MySaved() {
  const {data: session} = useSession();
  const [starredEntries, setStarredEntries] = useState<StarredEntryExt[]>();

  useEffect(() => {
    retrieveStarredEntries();
  }, []);

  async function retrieveStarredEntries() {
    if (!session || !session.user) return;

    try {
      const res = await fetch(`/api/starredEntry?userId=${session.user.id}`, {
        method: 'GET'
      });

      const starredEntries = await res.json();
      setStarredEntries(starredEntries);
    } catch (error) {
      console.log("error retrieving user's starred entries: " + error);
    }
  }

  function handleEntryChanged() {
    retrieveStarredEntries();
  }

  return (
    <div className="h-fit min-h-screen">
      {starredEntries && starredEntries.map((starredEntry) => {
        return <JournalEntryBox {...starredEntry.journalEntry} key={starredEntry.journalEntryId} onChange={handleEntryChanged}/>
      })}
    </ div>
  )
}