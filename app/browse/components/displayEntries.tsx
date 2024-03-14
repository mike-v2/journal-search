'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { JournalEntry } from '@prisma/client';

import { databaseDateToPrettyDate } from '@/utils/convertDate';
import JournalEntryBox from '@/components/journalEntryBox';
import JournalTopicBox from '@/components/journalTopicBox';

export default function DisplayEntries({
  journalEntries,
}: {
  journalEntries: JournalEntry[];
}) {
  const [mainEntryIndex, setMainEntryIndex] = useState(-100);
  const searchParams = useSearchParams();

  // set mainEntryIndex when 'month' or 'day' url params change
  useEffect(() => {
    const month = searchParams.get('month');
    const day = searchParams.get('day');

    if (month && day) {
      const entryIndex = journalEntries.findIndex((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getUTCMonth() === Number(month) - 1 &&
          entryDate.getUTCDate() === Number(day)
        );
      });

      if (entryIndex > -1) {
        setMainEntryIndex(entryIndex);
      }
    }
  }, [searchParams, journalEntries]);

  return (
    <section className='flex pb-12'>
      <div className='hidden p-8 xl:block xl:w-1/4'>
        {journalEntries[mainEntryIndex - 1] && (
          <div className='flex flex-col gap-y-4'>
            <p className='text-center text-xl font-bold'>
              {databaseDateToPrettyDate(
                journalEntries[mainEntryIndex - 1].date,
              )}
            </p>
            <div className='mx-auto w-2/3'>
              <JournalTopicBox
                journalEntryId={journalEntries[mainEntryIndex - 1].id}
              />
            </div>
          </div>
        )}
      </div>
      <div className='mx-auto w-11/12 lg:w-3/4 xl:w-1/2'>
        {journalEntries[mainEntryIndex] && (
          <JournalEntryBox {...journalEntries[mainEntryIndex]} />
        )}
      </div>
      <div className='hidden p-8 xl:block xl:w-1/4'>
        {journalEntries[mainEntryIndex + 1] && (
          <div className='flex flex-col gap-y-4'>
            <p className='text-center text-xl font-bold'>
              {databaseDateToPrettyDate(
                journalEntries[mainEntryIndex + 1].date,
              )}
            </p>
            <div className='mx-auto w-2/3'>
              <JournalTopicBox
                journalEntryId={journalEntries[mainEntryIndex + 1].id}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
