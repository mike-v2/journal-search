'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Slider from 'react-input-slider';
import { differenceInDays, setDayOfYear } from 'date-fns';

import { JournalEntryExt } from '@/types/prismaExtensions';
import { dateToJournalDate } from '@/utils/convertDate';

const displayMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function DateSlider({
  journalEntries,
}: {
  journalEntries: JournalEntryExt[];
}) {
  const [sliderDay, setSliderDay] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(300);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const month = searchParams.get('month');
    const day = searchParams.get('day');
    const year = searchParams.get('year');

    if (journalEntries) {
      const [m, d, y] = dateToJournalDate(journalEntries[0].date).split('-');
      if (year && year !== y) {
        // journal entries have not been updated to current year
        return;
      }

      // initialize month/day to first entry
      if (!month || !day) {
        const firstEntryDate = new Date(journalEntries[0].date);

        const month = firstEntryDate.getUTCMonth() + 1;
        const day = firstEntryDate.getUTCDate();

        setDateQueryString(month, day);
      }
    }
  }, [searchParams, journalEntries]);

  useEffect(() => {
    onResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
      };
    }
  }, []);

  function setDateQueryString(month: number, day: number) {
    const params = new URLSearchParams(searchParams);
    params.set('month', month.toString());
    params.set('day', day.toString());

    router.replace(`${pathname}?${params.toString()}`);
  }

  function onResize() {
    if (typeof window !== 'undefined') {
      const width = Math.min(window.innerWidth * 0.75, 800);
      setSliderWidth(width);
    }
  }

  function getCurrentEntryIndex() {
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
      return entryIndex;
    }
  }

  function handlePrevEntryButtonClick() {
    const currentEntryIndex = getCurrentEntryIndex();

    if (
      currentEntryIndex !== undefined &&
      journalEntries[currentEntryIndex - 1]
    ) {
      const prevEntry = journalEntries[currentEntryIndex - 1];
      const [month, day, year] = dateToJournalDate(prevEntry.date).split('-');
      const utcDate = new Date(Number(year), Number(month) - 1, Number(day));
      const dayOfYear = getDayOfYear(utcDate);

      changeCurrentDay({
        x: dayOfYear,
      });
    }
  }

  function handleNextEntryButtonClick() {
    const currentEntryIndex = getCurrentEntryIndex();

    if (
      currentEntryIndex !== undefined &&
      journalEntries[currentEntryIndex + 1]
    ) {
      const nextEntry = journalEntries[currentEntryIndex + 1];
      const [month, day, year] = dateToJournalDate(nextEntry.date).split('-');
      const utcDate = new Date(Number(year), Number(month) - 1, Number(day));
      const dayOfYear = getDayOfYear(utcDate);

      changeCurrentDay({ x: dayOfYear });
    }
  }

  function getDayOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const timeDiff = date.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
    return dayOfYear;
  }

  function findClosestEntry(targetDate: Date) {
    if (!journalEntries) return;

    let closestEntry = journalEntries[0];
    let smallestDifference = Infinity;

    journalEntries.forEach((entry) => {
      const difference = Math.abs(
        differenceInDays(targetDate, new Date(entry.date)),
      );
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestEntry = entry;
      }
    });

    return closestEntry;
  }

  function changeCurrentDay({ x }: { x: number }) {
    setSliderDay(x);

    const year = searchParams.get('year');
    if (year) {
      const sliderDate = setDayOfYear(new Date(Number(year), 0), x);
      const closestEntry = findClosestEntry(sliderDate);
      if (closestEntry) {
        const entryDate = new Date(closestEntry.date);
        setDateQueryString(entryDate.getUTCMonth() + 1, entryDate.getUTCDate());
      }
    }
  }

  return (
    <div className='h-100 relative m-5 mx-auto mt-28 w-fit'>
      <div className='relative z-10'>
        <Slider
          axis='x'
          x={sliderDay}
          xmax={365}
          onChange={changeCurrentDay}
          styles={{
            track: {
              width: sliderWidth,
            },
          }}
          aria-label='Day of the year slider'
        />
      </div>
      <button
        className='absolute bottom-3 left-0 -translate-x-full translate-y-1/2'
        onClick={handlePrevEntryButtonClick}
        aria-label='Previous entry'
      >
        <div className='hidden md:block'>
          <Image
            src={'/images/vintage_arrow_icon_2.png'}
            className='arrow-icon -z-10 object-cover'
            height={70}
            width={70}
            alt='Previous entry icon'
          />
        </div>
        <div className='pr-1 text-4xl md:hidden'>{'<'}</div>
      </button>
      <button
        className='absolute bottom-3 right-0 translate-x-full translate-y-1/2'
        onClick={handleNextEntryButtonClick}
        aria-label='Next entry'
      >
        <div className='hidden md:block'>
          <Image
            src={'/images/vintage_arrow_icon_2.png'}
            className='arrow-icon -z-10 rotate-180 object-cover'
            height={70}
            width={70}
            alt='Next entry icon'
          />
        </div>
        <div className='pl-1 text-4xl md:hidden'>{'>'}</div>
      </button>
      {displayMonths.map((month, index) => (
        <div
          key={index}
          className='absolute bottom-8 h-3'
          style={{ left: `${(index / 12) * 100}%` }}
        >
          <small className='absolute -translate-x-1/2 -rotate-90 md:rotate-0'>
            {month}
          </small>
        </div>
      ))}
    </div>
  );
}
