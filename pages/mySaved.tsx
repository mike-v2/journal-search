import JournalEntryBox from "@/components/journalEntryBox";
import { JournalEntry, StarredEntry } from "@prisma/client"
import { useSession } from "next-auth/react";
import { Josefin_Sans } from "next/font/google";
import Head from "next/head";
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
    <>
      <Head>
        <title>Harry's Journals</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
      </Head>
      <main>
        <div className="h-fit min-h-screen w-10/12 max-w-4xl mx-auto mt-20">
          {starredEntries && starredEntries.map((starredEntry) => {
            return (
              <div className="pt-10" key={starredEntry.journalEntryId}>
                <JournalEntryBox {...starredEntry.journalEntry} key={starredEntry.journalEntryId} onStarRemoved={handleStarRemoved} />
              </div>
            )
          })}
        </ div>
      </main>
    </>
  )
}