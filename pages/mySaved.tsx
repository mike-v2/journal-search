import JournalEntryBox from "@/components/journalEntryBox";
import { JournalEntry, StarredEntry } from "@prisma/client"
import { useSession } from "next-auth/react";
import { Josefin_Sans } from "next/font/google";
import { useCallback, useEffect, useState } from "react"

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
});

type StarredEntryExt = StarredEntry & { journalEntry: JournalEntry };

export default function MySaved() {
  const {data: session} = useSession();
  const [starredEntries, setStarredEntries] = useState<StarredEntryExt[]>([]);

  useEffect(() => {
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

    retrieveStarredEntries();
  }, []);

  function handleStarRemoved(journalEntryId: string) {
    setStarredEntries(prevEntries => prevEntries.filter(entry => entry.journalEntryId !== journalEntryId));
  }

  return (
    <div className="h-fit min-h-screen mt-20">
      {starredEntries && starredEntries.map((starredEntry) => {
        return <JournalEntryBox {...starredEntry.journalEntry} key={starredEntry.journalEntryId} onStarRemoved={handleStarRemoved}/>
      })}
    </ div>
  )
}