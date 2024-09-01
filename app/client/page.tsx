'use client';

import { useEffect, useState } from 'react';
import { JournalEntry } from '@prisma/client';
import JournalEntryBox from '@/components/journalEntryBox';

export default function Client() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/journalEntry?year=1944');
      const data = await response.json();
      setJournalEntries(data);
    };

    fetchData();
  }, []);

  return (
    <main className='min-h-screen'>
      <div className='grid grid-cols-2 gap-6'>
        {journalEntries &&
          journalEntries
            .slice(0, 4)
            .map((entry) => <JournalEntryBox key={entry.id} {...entry} />)}
      </div>
    </main>
  );
}
