'use client';

import JournalEntryBox from "./journalEntryBox";
import useFetchJournalEntries from "@/hooks/useFetchJournalEntries";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel as ResponsiveCarousel } from 'react-responsive-carousel';

const carouselEntries = [
  {
    entryDate: '06-24-1948',
  },
  {
    entryDate: '12-27-1944',
  },
  {
    entryDate: '12-28-1945',
  },
  {
    entryDate: '12-06-1944',
  },
  {
    entryDate: '08-24-1945',
  },
  {
    entryDate: '11-07-1945',
  },
  {
    entryDate: '6-10-1944',
  },
  {
    entryDate: '09-19-1948',
  },
  {
    entryDate: '04-16-1948',
  }
];

export default function Carousel() {
  const exampleEntries = useFetchJournalEntries(carouselEntries);

  return (
    <section className="max-w-5xl mx-auto border-2 border-black w-11/12 p-4">
      <ResponsiveCarousel autoPlay={true} infiniteLoop={true} interval={7000} transitionTime={1500} showThumbs={false}>
        {exampleEntries && exampleEntries.map((entry) => (
          <div key={entry.entryDate}>
            {entry.entry &&
              <JournalEntryBox {...entry.entry} />
            }
          </div>
        ))}
      </ResponsiveCarousel>
    </section>
  );
}
