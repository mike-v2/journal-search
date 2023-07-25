import JournalEntryBox from "@/components/journalEntryBox";
import { makeDatePretty, timestampToDate } from "@/utils/convertDate";
import { JournalEntry, StarredEntry } from "@prisma/client"
import { useSession } from "next-auth/react";
import { Josefin_Sans } from "next/font/google";
import Head from "next/head";
import { useEffect, useState } from "react"

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
});

type StarredEntryExt = StarredEntry & { journalEntry: JournalEntry };

export default function MySaved() {
  const {data: session} = useSession();
  const [starredEntries, setStarredEntries] = useState<StarredEntryExt[]>([]);
  const [activeEntry, setActiveEntry] = useState<StarredEntryExt>();
  const [sortMode, setSortMode] = useState<string>('journalDate');

  useEffect(() => {
    async function retrieveStarredEntries() {
      if (!session || !session.user) return;

      try {
        const res = await fetch(`/api/starredEntry?userId=${session.user.id}`, {
          method: 'GET'
        });

        if (res.status === 200) {
          const starredEntries = await res.json() as StarredEntryExt[];
          starredEntries.sort((a, b) => new Date(a.journalEntry.date).getTime() - new Date(b.journalEntry.date).getTime());
          setStarredEntries(starredEntries);

          if (!activeEntry && starredEntries && starredEntries.length > 0) {
            setActiveEntry(starredEntries[0])
          }
        } else console.log("received error response from starredEntry API. Status: " + res.status);
      } catch (error) {
        console.log("error retrieving user's starred entries: " + error);
      }
    }

    retrieveStarredEntries();
  }, [session]);

  useEffect(() => {
    console.log("setting sort mode: " + sortMode);
    if (sortMode === 'journalDate') {
      setStarredEntries(prevEntries => {
        // create new array so React recognizes state change
        const newEntries = [...prevEntries];
        return newEntries.sort((a, b) => new Date(a.journalEntry.date).getTime() - new Date(b.journalEntry.date).getTime());
      });
    } else if (sortMode === 'addedDate') {
      setStarredEntries(prevEntries => {
        // create new array so React recognizes state change
        const newEntries = [...prevEntries];
        return newEntries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
    }
  }, [sortMode]);

  function handleStarRemoved(journalEntryId: string) {
    setStarredEntries(prevEntries => prevEntries.filter(entry => entry.journalEntryId !== journalEntryId));
  }

  function handleDateClicked(clickedEntry: StarredEntryExt) {
    setActiveEntry(clickedEntry);
  }

  return (
    <>
      <Head>
        <title>Harry&apos;s Journals</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
      </Head>
      <main className="mt-12">
        <div className="flex justify-center mb-4">
          <select className="select select-bordered" value={sortMode} onChange={e => setSortMode(e.target.value)}>
            <option value='journalDate'>By Journal Date</option>
            <option value='addedDate'>By Date Added</option>
          </select>
        </div>
        <div className="tabs tabs-boxed justify-center w-fit mx-auto">
          {starredEntries && starredEntries.map((starredEntry, i) => {
            return <div className={`tab ${activeEntry?.journalEntryId === starredEntry.journalEntryId ? 'tab-active' : ''}`} onClick={e => handleDateClicked(starredEntry)} key={i}>{makeDatePretty(timestampToDate(new Date(starredEntry.journalEntry.date).toISOString()))}</div>
          })}
        </div>
        <div className="h-fit min-h-screen md:px-8 max-w-4xl mx-auto mt-12">
          {activeEntry &&
            <div className="pt-10" key={activeEntry.journalEntryId}>
              <JournalEntryBox {...activeEntry.journalEntry} onStarRemoved={handleStarRemoved} />
            </div>
          }
        </ div>
      </main>
    </>
  )
}