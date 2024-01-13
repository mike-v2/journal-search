'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import JournalEntryBox from '@/components/journalEntryBox';
import { StarredEntryExt } from '@/types/prismaExtensions';
import { makeDatePretty, timestampToDate } from '@/utils/convertDate';

export default function MySaved() {
  const { data: session } = useSession();
  const [starredEntries, setStarredEntries] = useState<StarredEntryExt[]>([]);
  const [activeEntry, setActiveEntry] = useState<StarredEntryExt>();
  const [sortMode, setSortMode] = useState<string>();

  useEffect(() => {
    async function retrieveStarredEntries() {
      if (!session || !session.user) return;

      try {
        const res = await fetch(`/api/starredEntry?userId=${session.user.id}`, {
          method: 'GET',
        });

        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const starredEntries = (await res.json()) as StarredEntryExt[];
        setStarredEntries(starredEntries);

        if (!activeEntry && starredEntries && starredEntries.length > 0) {
          setActiveEntry(starredEntries[0]);
        }
      } catch (error) {
        console.log("error retrieving user's starred entries: " + error);
      }
    }

    if (starredEntries.length === 0) {
      retrieveStarredEntries();
    }
  }, [session, activeEntry, starredEntries]);

  useEffect(() => {
    console.log('setting sort mode: ' + sortMode);
    if (sortMode === 'journalDate') {
      setStarredEntries((prevEntries) => {
        // create new array so React recognizes state change
        const newEntries = [...prevEntries];
        return newEntries.sort(
          (a, b) =>
            new Date(a.journalEntry.date).getTime() -
            new Date(b.journalEntry.date).getTime(),
        );
      });
    } else if (sortMode === 'addedDate') {
      setStarredEntries((prevEntries) => {
        // create new array so React recognizes state change
        const newEntries = [...prevEntries];
        return newEntries.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
    }
  }, [sortMode]);

  function handleStarRemoved(journalEntryId: string) {
    setStarredEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.journalEntryId !== journalEntryId),
    );
  }

  function handleDateClicked(clickedEntry: StarredEntryExt) {
    setActiveEntry(clickedEntry);
  }

  return (
    <main className='mt-12'>
      <div className='mb-4 flex justify-center'>
        <select
          className='select-bordered select'
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          <option value='journalDate'>By Journal Date</option>
          <option value='addedDate'>By Date Added</option>
        </select>
      </div>
      <div className='tabs tabs-boxed mx-auto w-fit justify-center'>
        {starredEntries &&
          starredEntries.map((starredEntry, i) => {
            return (
              <div
                className={`tab ${
                  activeEntry?.journalEntryId === starredEntry.journalEntryId
                    ? 'tab-active'
                    : ''
                }`}
                onClick={(e) => handleDateClicked(starredEntry)}
                key={i}
              >
                {makeDatePretty(
                  timestampToDate(
                    new Date(starredEntry.journalEntry.date).toISOString(),
                  ),
                )}
              </div>
            );
          })}
      </div>
      <div className='mx-auto mt-12 h-fit min-h-screen max-w-4xl md:px-8'>
        {activeEntry && (
          <div className='pt-10' key={activeEntry.journalEntryId}>
            <JournalEntryBox
              {...activeEntry.journalEntry}
              onStarRemoved={handleStarRemoved}
            />
          </div>
        )}
      </div>
    </main>
  );
}
