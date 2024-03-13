import { JournalEntry } from '@prisma/client';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const DynamicCarouselJournalEntries = dynamic(
  () => import('@/app/home.components/carouselJournalEntries'),
  {
    loading: () => <p>Loading...</p>,
  },
);

export function Entries({
  journalEntries,
}: {
  journalEntries: JournalEntry[];
}) {
  return (
    <section className='mt-64 pb-32'>
      <h2 className='mx-auto my-12 w-full max-w-lg'>
        <Image
          src='/images/banner-sample-entries.png'
          width={352}
          height={896}
          className='h-auto w-full'
          alt='Sample entries title'
        />
      </h2>
      <DynamicCarouselJournalEntries journalEntries={journalEntries} />
    </section>
  );
}
