'use client';

import { useEffect, useState } from 'react';
import { JournalEntry } from '@prisma/client';
import JournalEntryBox from '@/components/journalEntryBox';

export default function Client() {
  const [journalEntry, setJournalEntry] = useState<JournalEntry>();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/journalEntry?date=1-1-1944');
      const data = await response.json();
      setJournalEntry(data);
    };

    fetchData();
  }, []);

  return (
    <main className='min-h-screen'>
      <div className='grid grid-cols-2 gap-6'>
        {journalEntry && (
          <JournalEntryBox key={journalEntry.id} {...journalEntry} />
        )}
      </div>
    </main>
  );
}
