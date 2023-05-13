import { dateToJournalDate, journalDateToDate, makeDatePretty } from '@/utils/convertDate';
import { useEffect, useState } from 'react';
import Slider from 'react-input-slider'
import { addDays, addWeeks, differenceInDays, eachMonthOfInterval, format, isAfter, isBefore, subWeeks } from 'date-fns';
import { JournalEntry } from '@prisma/client';
import JournalEntryBox from '@/components/journalEntryBox';

interface GraphTrace {
  property: string,
  value: string,
  x: string[],
  y: number[],
}

const sliderStartDate = new Date("01/01/1948"); 
const sliderEndDate = new Date("12/31/1948");
const months = eachMonthOfInterval({ start: sliderStartDate, end: sliderEndDate });

export default function Browse() {
  const [dateMap, setDateMap] = useState<Map<string, []>>();
  const [graphData, setGraphData] = useState<GraphTrace[]>();
  const [sliderDay, setSliderDay] = useState(0);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>();
  const [displayEntryMain, setDisplayEntryMain] = useState<JournalEntry>();
  const [displayEntryBefore, setDisplayEntryBefore] = useState<JournalEntry>();
  const [displayEntryAfter, setDisplayEntryAfter] = useState<JournalEntry>();
  const [graphMinDate, setGraphMinDate] = useState<Date>(sliderStartDate);
  const [graphMaxDate, setGraphMaxDate] = useState<Date>(sliderEndDate);
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    fetchMapData();
    fetchJournalEntries();

    window.addEventListener('resize', onResize);
  }, []);

  function onResize() {
    setScreenWidth(window.innerWidth);
  }


  useEffect(() => {
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
  }, [dateMap, sliderDay, graphMinDate, graphMaxDate])

  async function fetchMapData() {
    try {
      const res = await fetch('/api/entriesData');
      const dataStr = await res.json();
      const data = JSON.parse(dataStr);

      setDateMap(new Map(Object.entries(data)));
    } catch (error) {
      console.log("error retrieving data: " + error);
    }
  }

  async function fetchJournalEntries() {
    try {
      const res = await fetch('/api/journalEntry');
      const data = await res.json();

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

    const currentSliderDate = addDays(sliderStartDate, x);
    const closestEntry = findClosestEntry(currentSliderDate);
    if (closestEntry) {
      setDisplayEntryMain(closestEntry);

      const closestIndex = journalEntries.indexOf(closestEntry);
      const beforeIndex = closestIndex - 1;
      const afterIndex = closestIndex + 1;
      if (beforeIndex > -1) {
        setDisplayEntryBefore(journalEntries[beforeIndex])
      }
      if (afterIndex < journalEntries.length) {
        setDisplayEntryAfter(journalEntries[afterIndex])
      }
    }

    //let graphMin = subMonths(currentSliderDate, 1);
    let graphMin = subWeeks(currentSliderDate, 2);
    if (isBefore(graphMin, sliderStartDate)) {
      graphMin = sliderStartDate;
    }
    setGraphMinDate(graphMin);

    //let graphMax = addMonths(currentSliderDate, 1);
    let graphMax = addWeeks(currentSliderDate, 2);
    if (isAfter(graphMax, sliderEndDate)) {
      graphMax = sliderEndDate;
    }
    setGraphMaxDate(graphMax);
  };

  return (
    <div className=''>
      <div className='w-fit h-fit mx-auto p-5'>
        {/* graphData && 
        <Plot
          data={graphData.map((gData) => {
            return {
              name: `${gData.property}:${gData.value}`,
              type: 'scatter',
              mode: 'lines+markers',
              x: gData.x,
              y: gData.y,
              connectgaps: true,
            };
          })}
          layout={{
            width: 800,
            height: 300,
            title: 'Significant Topics',
            xaxis: {
              tickformat: '%m-%d',
            }
          }}
        /> */}
        
      </div>
      
      <div className='w-fit h-100 mx-auto relative m-5'>
        <Slider
          axis="x"
          x={sliderDay}
          xmax={365}
          onChange={handleSliderChange}
          styles={{
            track: {
              width: window.innerWidth * .8,
            },
          }}
        />

        {months.map((month, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              bottom: 30,
              left: `${(index / 12) * 100}%`,
              height: 10,
              backgroundColor: '#000',
            }}
          >
            <small style={{ position: 'absolute', transform: 'translateX(-50%)' }}>
              {format(month, 'MMM')}
            </small>
          </div>
        ))}
      </div>
      <div>
        <div className="flex">
          <div className='hidden lg:block lg:w-1/3'>
            {displayEntryBefore && <JournalEntryBox {...displayEntryBefore} />}
          </div>
          <div className='w-full lg:w-1/3'>
            {displayEntryMain && <JournalEntryBox {...displayEntryMain} />}
          </div>
          <div className='hidden lg:block lg:w-1/3'>
            {displayEntryAfter && <JournalEntryBox {...displayEntryAfter} />}
          </div>
        </div>
      </div>
    </div>
  )
}