'use client';

import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel as ResponsiveCarousel } from 'react-responsive-carousel';

import JournalEntryBox from '@/components/journalEntryBox';
import { JournalEntry } from '@prisma/client';

export default function CarouselJournalEntries({
  journalEntries,
}: {
  journalEntries: JournalEntry[];
}) {
  return (
    <div className='mx-auto w-11/12 max-w-5xl border-2 border-black p-4'>
      <ResponsiveCarousel
        autoPlay={true}
        infiniteLoop={true}
        interval={7000}
        transitionTime={1500}
        showThumbs={false}
        showIndicators={false}
      >
        {journalEntries &&
          journalEntries.map((entry) => (
            <div key={entry.id}>{entry && <JournalEntryBox {...entry} />}</div>
          ))}
      </ResponsiveCarousel>
    </div>
  );
}
