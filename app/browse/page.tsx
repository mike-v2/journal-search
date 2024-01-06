'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

import Slider from 'react-input-slider';
import { addDays, differenceInDays } from 'date-fns';
import { JournalEntry, ReadEntry } from '@prisma/client';

import { makeDatePretty, timestampToDate } from '@/utils/convertDate';
import JournalEntryBox from '@/components/journalEntryBox';
import JournalTopicBox from '@/components/journalTopicBox';

type JournalEntryExt = JournalEntry & {
  readBy: ReadEntry[];
};

const yearsIncluded = ['1944', '1945', '1946', '1947', '1948'];
const startYear = yearsIncluded[0];
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

export default function Browse() {
  const { data: session } = useSession();
  const [sliderDay, setSliderDay] = useState(0);
  const [journalEntries, setJournalEntries] = useState<JournalEntryExt[]>();
  const [displayEntryMain, setDisplayEntryMain] = useState<JournalEntry>();
  const [displayEntryBefore, setDisplayEntryBefore] = useState<JournalEntry>();
  const [displayEntryAfter, setDisplayEntryAfter] = useState<JournalEntry>();
  const [sliderWidth, setSliderWidth] = useState<number>(300);
  const [currentYear, setCurrentYear] = useState<string>(startYear);

  useEffect(() => {
    onResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
      };
    }
  }, []);

  const findClosestEntry = useCallback(
    (targetDate: Date) => {
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
    },
    [journalEntries],
  );

  const getIndexByDate = useCallback(
    (date: Date): number => {
      if (journalEntries) {
        for (let i = 0; i < journalEntries.length; i++) {
          if (journalEntries[i].date == date) return i;
        }
      }
      return -1;
    },
    [journalEntries],
  );

  const getPreviousEntry = useCallback(
    (entry: JournalEntry): JournalEntry | undefined => {
      if (!journalEntries) return undefined;

      const currentIndex = getIndexByDate(entry.date);
      if (currentIndex > -1) {
        const beforeIndex = currentIndex - 1;
        if (beforeIndex > -1) {
          return journalEntries[beforeIndex];
        }
      }
    },
    [journalEntries, getIndexByDate],
  );

  const getNextEntry = useCallback(
    (entry: JournalEntry): JournalEntry | undefined => {
      if (!journalEntries) return undefined;

      const currentIndex = getIndexByDate(entry.date);
      if (currentIndex > -1) {
        const afterIndex = currentIndex + 1;
        if (afterIndex < journalEntries.length) {
          return journalEntries[afterIndex];
        }
      }
    },
    [journalEntries, getIndexByDate],
  );

  const setDisplayEntry = useCallback(
    (entry: JournalEntry) => {
      setDisplayEntryMain(entry);

      const prevEntry = getPreviousEntry(entry);
      setDisplayEntryBefore(prevEntry);
      const nextEntry = getNextEntry(entry);
      setDisplayEntryAfter(nextEntry);
    },
    [getPreviousEntry, getNextEntry],
  );

  const changeCurrentDay = useCallback(
    ({ x }: { x: number }) => {
      setSliderDay(x);

      const firstDayOfCurrentYear = new Date(parseInt(currentYear), 0, 1);
      const currentSliderDate = addDays(firstDayOfCurrentYear, x);
      const closestEntry = findClosestEntry(currentSliderDate);
      if (closestEntry) {
        setDisplayEntry(closestEntry);
      }
    },
    [currentYear, findClosestEntry, setDisplayEntry],
  );

  useEffect(() => {
    // set the current entry to the first one in the current year that hasn't been read yet
    if (journalEntries) {
      if (session?.user) {
        for (const index in journalEntries) {
          const hasRead = journalEntries[index].readBy.some(
            (prop) => prop.userId === session?.user.id,
          );
          if (!hasRead) {
            const days = dateToSliderDays(journalEntries[index].date);
            changeCurrentDay({ x: days });
            return;
          }
        }
      }

      changeCurrentDay({ x: 0 });
    }
  }, [journalEntries, session, changeCurrentDay]);

  function dateToSliderDays(d: Date): number {
    const date = new Date(d);
    const start = Date.UTC(date.getUTCFullYear(), 0, 1);
    return Math.floor((date.getTime() - start) / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    fetchJournalEntries(currentYear);
  }, [currentYear]);

  function onResize() {
    if (typeof window !== 'undefined') {
      const width = Math.min(window.innerWidth * 0.75, 800);
      setSliderWidth(width);
    }
  }

  async function fetchJournalEntries(year: string) {
    try {
      const response = await fetch(`/api/journalEntry?year=${year}`);
      const data = await response.json();

      setJournalEntries(data);
    } catch (error) {
      console.error(error);
    }
  }

  function handlePrevEntryButtonClick() {
    if (displayEntryMain) {
      const prevEntry = getPreviousEntry(displayEntryMain);
      if (prevEntry) {
        const days = dateToSliderDays(prevEntry.date);
        changeCurrentDay({ x: days });
      }
    }
  }

  function handleNextEntryButtonClick() {
    if (displayEntryMain) {
      const nextEntry = getNextEntry(displayEntryMain);
      if (nextEntry) {
        const days = dateToSliderDays(nextEntry.date);
        changeCurrentDay({ x: days });
      }
    }
  }

  return (
    <main className='min-h-screen'>
      <section aria-label='Year navigation and day slider'>
        <div className='mt-12 flex justify-center' aria-label='Year navigation'>
          {yearsIncluded.map((year, i) => {
            return (
              <div className='tabs tabs-boxed' key={i}>
                <button
                  className={`tab tab-lg ${
                    year === currentYear ? 'tab-active' : ''
                  }`}
                  onClick={(e) => setCurrentYear(year)}
                  aria-label={`Year ${year}`}
                >
                  {year}
                </button>
              </div>
            );
          })}
        </div>
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
      </section>

      <section className='flex pb-12' aria-label='Journal entries'>
        <div className='hidden p-8 xl:block xl:w-1/4'>
          {displayEntryBefore && (
            <div
              className='flex cursor-pointer flex-col gap-y-4'
              onClick={handlePrevEntryButtonClick}
            >
              <p className='text-center text-xl font-bold'>
                {makeDatePretty(
                  timestampToDate(
                    new Date(displayEntryBefore.date).toISOString(),
                  ),
                )}
              </p>
              <div className='mx-auto w-2/3'>
                <JournalTopicBox journalEntryId={displayEntryBefore.id} />
              </div>
            </div>
          )}
        </div>
        <div className='mx-auto w-11/12 lg:w-3/4 xl:w-1/2'>
          {displayEntryMain && <JournalEntryBox {...displayEntryMain} />}
        </div>
        <div className='hidden p-8 xl:block xl:w-1/4'>
          {displayEntryAfter && (
            <div
              className='flex cursor-pointer flex-col gap-y-4'
              onClick={handleNextEntryButtonClick}
            >
              <p className='text-center text-xl font-bold'>
                {makeDatePretty(
                  timestampToDate(
                    new Date(displayEntryAfter.date).toISOString(),
                  ),
                )}
              </p>
              <div className='mx-auto w-2/3'>
                <JournalTopicBox journalEntryId={displayEntryAfter.id} />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
