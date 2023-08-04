import { makeDatePretty, timestampToDate } from '@/utils/convertDate';
import { useCallback, useEffect, useState } from 'react';
import Slider from 'react-input-slider'
import { addDays, differenceInDays } from 'date-fns';
import { JournalEntry, ReadEntry } from '@prisma/client';
import JournalEntryBox from '@/components/journalEntryBox';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import JournalTopicBox from '@/components/journalTopicBox';

interface JournalEntryExt extends JournalEntry {
  userId: string,
  readBy: ReadEntry[],
}

const startYear = '1948';
const yearsIncluded = ['1944', '1945', '1946', '1947', '1948'];
const displayMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] 

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
    if (typeof window !== "undefined") {
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
      }
    }
  }, []);

  const findClosestEntry = useCallback((targetDate: Date) => {
    if (!journalEntries) return;

    let closestEntry = journalEntries[0];
    let smallestDifference = Infinity;

    journalEntries.forEach(entry => {
      const difference = Math.abs(differenceInDays(targetDate, new Date(entry.date)));
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestEntry = entry;
      }
    });

    return closestEntry;
  }, [journalEntries]);

  const getIndexByDate = useCallback((date: Date): number => {
    if (journalEntries) {
      for (let i = 0; i < journalEntries.length; i++) {
        if (journalEntries[i].date == date) return i;
      }
    }
    return -1;
  }, [journalEntries]);

  const getPreviousEntry = useCallback((entry: JournalEntry): JournalEntry | undefined => {
    if (!journalEntries) return undefined;

    const closestIndex = getIndexByDate(entry.date);
    if (closestIndex > -1) {
      const beforeIndex = closestIndex - 1;
      if (beforeIndex > -1) {
        return journalEntries[beforeIndex];
      }
    }
  }, [journalEntries, getIndexByDate])

  const getNextEntry = useCallback((entry: JournalEntry): JournalEntry | undefined => {
    if (!journalEntries) return undefined;

    const closestIndex = getIndexByDate(entry.date);
    if (closestIndex > -1) {
      const afterIndex = closestIndex + 1;
      if (afterIndex < journalEntries.length) {
        return journalEntries[afterIndex];
      }
    }
  }, [journalEntries, getIndexByDate])

  const setDisplayEntry = useCallback((entry: JournalEntry) => {
    setDisplayEntryMain(entry);

    const prevEntry = getPreviousEntry(entry);
    setDisplayEntryBefore(prevEntry);
    const nextEntry = getNextEntry(entry);
    setDisplayEntryAfter(nextEntry);
  }, [getPreviousEntry, getNextEntry]);

  const setCurrentDay = useCallback(({ x }: { x: number }) => {
    setSliderDay(x);

    const firstDayOfCurrentYear = new Date(parseInt(currentYear), 0, 1);
    const currentSliderDate = addDays(firstDayOfCurrentYear, x);
    const closestEntry = findClosestEntry(currentSliderDate);
    if (closestEntry) {
      setDisplayEntry(closestEntry);
    }
  }, [currentYear, findClosestEntry, setDisplayEntry]);

  useEffect(() => {
    // set the current entry to the first one in the current year that hasn't been read yet
    if (journalEntries) {
      if (session?.user) {
        for (const index in journalEntries) {
          const hasRead = journalEntries[index].readBy.some(prop => prop.userId === session?.user.id);
          if (!hasRead) {
            const days = dateToSliderDays(journalEntries[index].date);
            setCurrentDay({ x: days });
            return;
          }
        }
      }

      setCurrentDay({ x: 0 });
    }
  }, [journalEntries, session, setCurrentDay])

  function dateToSliderDays(d: Date): number {
    const date = new Date(d);
    const start = Date.UTC(date.getUTCFullYear(), 0, 1);
    return Math.floor((date.getTime() - start) / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    fetchJournalEntries(currentYear);
  }, [currentYear])

  function onResize() {
    if (typeof window !== "undefined") {
      const width = Math.min(window.innerWidth * .75, 800);
      setSliderWidth(width);
    }
  }

  async function fetchJournalEntries(year: string): Promise<void> {
    try {
      const response = await fetch(`/api/journalEntry?year=${year}`);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

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
        setCurrentDay({ x: days });
      }
    }
  }

  function handleNextEntryButtonClick() {
    if (displayEntryMain) {
      const nextEntry = getNextEntry(displayEntryMain);
      if (nextEntry) {
        const days = dateToSliderDays(nextEntry.date);
        setCurrentDay({ x: days });
      }
    }
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
      <main className='min-h-screen'>
        <section aria-label="Year navigation and day slider">
          <div className='flex justify-center mt-12' aria-label="Year navigation">
            {yearsIncluded.map((year, i) => {
              return (
                <div className='tabs tabs-boxed' key={i}>
                  <button className={`tab tab-lg ${year === currentYear ? 'tab-active' : ''}`} onClick={e => setCurrentYear(year)} aria-label={`Year ${year}`}>{year}</button>
                </div>
              )
            })}
          </div>
          <div className='w-fit h-100 mx-auto relative m-5 mt-28'>
            <div className='relative z-10'>
              <Slider
                axis="x"
                x={sliderDay}
                xmax={365}
                onChange={setCurrentDay}
                styles={{
                  track: {
                    width: sliderWidth,
                  },
                }}
                aria-label="Day of the year slider"
              />
            </div>
            <button className='absolute left-0 bottom-3 translate-y-1/2 -translate-x-full' onClick={handlePrevEntryButtonClick} aria-label="Previous entry">
              <div className='hidden md:block'>
                <Image src={'/images/vintage_arrow_icon_2.png'} className='arrow-icon object-cover -z-10' height={70} width={70} alt='Previous entry icon' />
              </div>
              <div className='md:hidden text-4xl pr-1'>
                {'<'}
              </div>
            </button>
            <button className='absolute right-0 bottom-3 translate-y-1/2 translate-x-full' onClick={handleNextEntryButtonClick} aria-label="Next entry">
              <div className='hidden md:block'>
                <Image src={'/images/vintage_arrow_icon_2.png'} className='arrow-icon rotate-180 object-cover -z-10' height={70} width={70} alt='Next entry icon' />
              </div>
              <div className='md:hidden text-4xl pl-1'>
                {'>'}
              </div>
            </button>
            {displayMonths.map((month, index) => (
              <div key={index} className='absolute bottom-8 h-3' style={{ left: `${(index / 12) * 100}%`, }}>
                <small className='absolute -translate-x-1/2 -rotate-90 md:rotate-0'>
                  {month}
                </small>
              </div>
            ))}
          </div>
        </section>

        <section className="flex pb-12" aria-label="Journal entries">
          <div className='hidden xl:block xl:w-1/4 p-8'>
            {displayEntryBefore &&
              <div className='flex flex-col gap-y-4 cursor-pointer' onClick={handlePrevEntryButtonClick}>
                <p className='text-xl font-bold text-center'>{makeDatePretty(timestampToDate(new Date(displayEntryBefore.date).toISOString()))}</p>
                <div className='w-2/3 mx-auto'>
                  <JournalTopicBox journalEntryId={displayEntryBefore.id} />
                </div>
              </div>
            }
          </div>
          <div className='w-11/12 lg:w-3/4 xl:w-1/2 mx-auto'>
            {displayEntryMain && <JournalEntryBox {...displayEntryMain} />}
          </div>
          <div className='hidden xl:block xl:w-1/4 p-8'>
            {displayEntryAfter &&
              <div className='flex flex-col gap-y-4 cursor-pointer' onClick={handleNextEntryButtonClick}>
                <p className='text-xl font-bold text-center'>{makeDatePretty(timestampToDate(new Date(displayEntryAfter.date).toISOString()))}</p>
                <div className='w-2/3 mx-auto'>
                  <JournalTopicBox journalEntryId={displayEntryAfter.id} />
                </div>
              </div>
            }
          </div>
        </section>
      </main>
    </>
  )
}