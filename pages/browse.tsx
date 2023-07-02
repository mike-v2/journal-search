import { dateToJournalDate, journalDateToCondensedDate, journalDateToDate, makeDatePretty } from '@/utils/convertDate';
import { useEffect, useState } from 'react';
import Slider from 'react-input-slider'
import { addDays, addWeeks, differenceInDays, eachMonthOfInterval, format, isAfter, isBefore, startOfYear, subWeeks } from 'date-fns';
import { JournalEntry, ReadEntry, User } from '@prisma/client';
import JournalEntryBox from '@/components/journalEntryBox';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { parseISO } from 'date-fns';
import Head from 'next/head';

interface GraphTrace {
  property: string,
  value: string,
  x: string[],
  y: number[],
}

interface JournalEntryExt extends JournalEntry {
  userId: string,
  readBy: ReadEntry[],
}

const startYear = '1948';
const yearsIncluded = ['1946', '1947', '1948'];
const displayMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] 

export default function Browse() {
  const { data: session } = useSession();
  //const [dateMap, setDateMap] = useState<Map<string, []>>();
  //const [graphData, setGraphData] = useState<GraphTrace[]>();
  const [sliderDay, setSliderDay] = useState(0);
  const [journalEntries, setJournalEntries] = useState<JournalEntryExt[]>();
  const [displayEntryMain, setDisplayEntryMain] = useState<JournalEntry>();
  const [displayEntryBefore, setDisplayEntryBefore] = useState<JournalEntry>();
  const [displayEntryAfter, setDisplayEntryAfter] = useState<JournalEntry>();
  //const [graphMinDate, setGraphMinDate] = useState<Date>(new Date(parseInt(startYear), 0, 1));
  //const [graphMaxDate, setGraphMaxDate] = useState<Date>(new Date(parseInt(startYear), 12, 31));
  const [sliderWidth, setSliderWidth] = useState<number>(300);
  const [currentYear, setCurrentYear] = useState<string>(startYear);


  useEffect(() => {
    //fetchMapData();

    onResize();
    if (typeof window !== "undefined") {
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
      }
    }
  }, []);

  useEffect(() => {
    if (journalEntries) {
      for (const index in journalEntries) {
        const hasRead = journalEntries[index].readBy.some(prop => prop.userId === session?.user.id);
        if (!hasRead) {
          const dateStr = journalEntries[index].date.toString();
          const date = new Date(dateStr);
          const start = Date.UTC(date.getUTCFullYear(), 0, 1);
          const days = Math.floor((date.getTime() - start) / (1000 * 60 * 60 * 24));

          handleSliderChange({ x: days });
          return;
        }
      }

      handleSliderChange({x: 0});
    }
  }, [journalEntries])

  /* useEffect(() => {
    function findMostFrequentProperties(start: Date, end: Date) {
      if (!dateMap) return;

      let propertyCounts = new Map();
      let trackedCounts = new Map();

      for (let [dateStr, entries] of dateMap) {
        const date = journalDateToDate(dateStr);

        if (date >= start && date <= end) {
          for (let entry of entries) {
            let { property, value, count, strength } = entry;

            if (!propertyCounts.has(property)) {
              propertyCounts.set(property, new Map());
            }

            let countMap: Map<string, number> = propertyCounts.get(property);

            if (!countMap.has(value)) {
              countMap.set(value, 0);
            }

            countMap.set(value, (countMap.get(value) ?? 0) + count * Math.abs(strength));

            if (!trackedCounts.has(property)) {
              trackedCounts.set(property, new Map());
            }

            let trackedCountMap = trackedCounts.get(property);
            if (!trackedCountMap.has(value)) {
              trackedCountMap.set(value, new Map());
            }

            let dateCountMap = trackedCountMap.get(value);
            dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + count * Math.abs(strength));
          }
        }
      }

      let mostFrequentProperties: Map<string, { value: string, score: number }> = new Map(); 
      for (let [property, countMap] of propertyCounts) {
        let entries: Array<[string, number]> = Array.from(countMap.entries());

        let mostFrequentValue: [string, number] = entries.length > 0
          ? entries.reduce((a: [string, number], b: [string, number]) => b[1] > a[1] ? b : a, ['', 0])
          : ['', 0];
        mostFrequentProperties.set(property, { value: mostFrequentValue[0], score: mostFrequentValue[1] });
      }

      let allDates = [];
      let currentDate = start;
      while (currentDate <= end) {
        const jDate = dateToJournalDate(currentDate);
        allDates.push(jDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      let trackedFrequentCounts = new Map();
      for (let [property, { value }] of mostFrequentProperties) {
        let dateCountMap = trackedCounts.get(property).get(value);
        let dates = allDates; //Array.from(dateCountMap.keys()).sort();
        let scores = dates.map(date => dateCountMap.get(date) || null);
        trackedFrequentCounts.set(property, { value, dates, scores });
      }

      return trackedFrequentCounts;
    }

    function setGraphValues() {
      const mostFrequent = findMostFrequentProperties(new Date(graphMinDate.getTime()), new Date(graphMaxDate.getTime()));
      if (!mostFrequent) return;

      const gData = [];
      for (let [property, { value, dates, scores }] of mostFrequent) {
        const condensedDates = [];
        for (let date of dates) {
          condensedDates.push(makeDatePretty(date).split(',')[0]);
        }

        const trace: GraphTrace = {
          property: property,
          value: value.slice(0, 15),
          x: condensedDates,
          y: scores
        };

        gData.push(trace);
      }

      setGraphData(gData);
    }

    if (dateMap) {
      setGraphValues();
    }
  }, [dateMap, sliderDay, graphMinDate, graphMaxDate]) */

  useEffect(() => {
    fetchJournalEntries(currentYear);
  }, [currentYear])

  function onResize() {
    if (typeof window !== "undefined") {
      const width = Math.min(window.innerWidth * .75, 800);
      setSliderWidth(width);
    }
  }

  async function fetchMapData() {
    //TODO fetch any required analysis data from Google Cloud Storage

    /* try {
      const res = await fetch('/api/entriesData');
      const dataStr = await res.json();
      const data = JSON.parse(dataStr);

      setDateMap(new Map(Object.entries(data)));
    } catch (error) {
      console.log("error retrieving data: " + error);
    } */
  }

  async function fetchJournalEntries(year: string) {
    try {
      const res = await fetch(`/api/journalEntry?year=${year}`);
      const data = await res.json();

      console.log(`retrieved ${data.length} entries`)

      data.sort((x: JournalEntry, y: JournalEntry) => {
        const dateX = new Date(x.date);
        const dateY = new Date(y.date);
        return dateX.getTime() - dateY.getTime();
      })

      setJournalEntries(data);
    } catch (error) {
      console.log("could not retrieve journal entries: " + error);
    }
  }

  function findClosestEntry(targetDate: Date) {
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
  }

  function handleSliderChange ({ x }: {x: number}) {
    if (!journalEntries) return;

    setSliderDay(x);

    const firstDayOfCurrentYear = new Date(parseInt(currentYear), 0, 1);
    const currentSliderDate = addDays(firstDayOfCurrentYear, x);
    const closestEntry = findClosestEntry(currentSliderDate);
    if (closestEntry) {
      setDisplayEntry(closestEntry);
    }
  };

  function setDisplayEntry(entry: JournalEntry) {
    if (journalEntries) {
      setDisplayEntryMain(entry);

      const prevEntry = getPreviousEntry(entry);
      setDisplayEntryBefore(prevEntry);
      const nextEntry = getNextEntry(entry);
      setDisplayEntryAfter(nextEntry);
    }
  }

  function getPreviousEntry(entry: JournalEntry) : JournalEntry | undefined{
    if (!journalEntries) return undefined;

    const closestIndex = getIndexByDate(entry.date);
    if (closestIndex > -1) {
      const beforeIndex = closestIndex - 1;
      if (beforeIndex > -1) {
        return journalEntries[beforeIndex];
      }
    }
  }

  function getNextEntry(entry: JournalEntry) : JournalEntry | undefined {
    if (!journalEntries) return undefined;

    const closestIndex = getIndexByDate(entry.date);
    if (closestIndex > -1) {
      const afterIndex = closestIndex + 1;
      if (afterIndex < journalEntries.length) {
        return journalEntries[afterIndex];
      }
    }
  }

  function getIndexByDate(date: Date) : number {
    if (journalEntries) {
      for (let i = 0; i < journalEntries.length; i++) {
        if (journalEntries[i].date == date) return i;
      }
    }
    return -1;
  }

  function handlePrevPageButtonClick() {
    if (displayEntryMain) {
      const prevEntry = getPreviousEntry(displayEntryMain);
      if (prevEntry) {
        setDisplayEntry(prevEntry);
      }
    }
  }

  function handleNextPageButtonClick() {
    if (displayEntryMain) {
      const nextEntry = getNextEntry(displayEntryMain);
      if (nextEntry) {
        setDisplayEntry(nextEntry);
      }
    }
  }

  function handleYearClick(year: string) {
    console.log("setting current year to " + year);
    setCurrentYear(year);
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
        <div className='flex justify-center'>
          {yearsIncluded.map((year, i) => {
            return (
              <div className='tabs tabs-boxed' key={i}>
                <button className={`tab tab-lg ${year === currentYear ? 'tab-active' : ''}`} onClick={e => handleYearClick(year)}>{year}</button>
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
              onChange={handleSliderChange}
              styles={{
                track: {
                  width: sliderWidth,
                },
              }}
            />
          </div>
          <div className='absolute left-0 bottom-3 translate-y-1/2 -translate-x-full'>
            <div className='h-16 w-16 translate-x-4 flex justify-center' onClick={handlePrevPageButtonClick}>
              <Image src={'/images/vintage_arrow_icon_2.png'} className='arrow-icon object-cover -z-10' height={70} width={70} alt='arrow icon' />
            </div>
          </div>
          <div className='absolute right-0 bottom-3 translate-y-1/2 translate-x-full '>
            <div className='h-16 w-16 -translate-x-4' onClick={handleNextPageButtonClick}>
              <Image src={'/images/vintage_arrow_icon_2.png'} className='arrow-icon rotate-180 object-cover -z-10' height={70} width={70} alt='arrow icon' />
            </div>
          </div>
          {displayMonths.map((month, index) => (
            <div key={index} className='absolute bottom-8 h-3' style={{ left: `${(index / 12) * 100}%`, }}
            >
              <small className='absolute -translate-x-1/2'>
                {month}
              </small>
            </div>
          ))}
        </div>
        <div className="flex pb-12">
          <div className='hidden xl:block xl:w-1/4 p-8'>
            {displayEntryBefore && <JournalEntryBox {...displayEntryBefore} />}
          </div>
          <div className='basis-11/12 lg:w-3/4 xl:w-1/2 mx-auto'>
            {displayEntryMain && <JournalEntryBox {...displayEntryMain} />}
          </div>
          <div className='hidden xl:block xl:w-1/4 p-8'>
            {displayEntryAfter && <JournalEntryBox {...displayEntryAfter} />}
          </div>
        </div>
      </main>
    </>

  )
}