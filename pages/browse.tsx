import { dateToJournalDate, journalDateToDate, journalDateToCondensedDate } from '@/utils/convertDate';
import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

interface GraphTrace {
  property: string,
  value: string,
  x: string[],
  y: number[],
}

export default function Browse() {
  const [dateMap, setDateMap] = useState<Map<string, []>>();
  const [graphData, setGraphData] = useState<GraphTrace[]>();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (dateMap) {
      setGraphValues();
    }
  }, [dateMap])

  function setGraphValues() {
    const mostFrequent = findMostFrequentProperties("2-20-1948", "4-01-1948");
    if (!mostFrequent) return;

    const gData = [];
    for (let [property, { value, dates, scores }] of mostFrequent) {
      const condensedDates = [];
      for (let date of dates) {
        condensedDates.push(journalDateToCondensedDate(date));
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

  async function fetchData() {
    try {
      const res = await fetch('/api/entriesData');
      const dataStr = await res.json();
      const data = JSON.parse(dataStr);

      setDateMap(new Map(Object.entries(data)));
    } catch (error) {
      console.log("error retrieving data: " + error);
    }
  }

  function findMostFrequentProperties(startJDate: string, endJDate: string) {
    if (!dateMap) return;

    let propertyCounts = new Map();
    let trackedCounts = new Map();

    const start = journalDateToDate(startJDate);
    const end = journalDateToDate(endJDate);

    for (let [dateStr, entries] of dateMap) {
      const date = journalDateToDate(dateStr);

      if (date >= start && date <= end) {
        for (let entry of entries) {
          let { property, value, count, strength } = entry;

          if (!propertyCounts.has(property)) {
            propertyCounts.set(property, new Map());
          }

          let countMap = propertyCounts.get(property);

          if (!countMap.has(value)) {
            countMap.set(value, 0);
          }

          countMap.set(value, countMap.get(value) + count * Math.abs(strength));

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

    let mostFrequentProperties = new Map<string, {value: string, score: number}>();
    for (let [property, countMap] of propertyCounts) {
      let mostFrequentValue = Array.from(countMap.entries()).reduce((a, b) => b[1] > a[1] ? b : a);
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

  return (
    <>
    <div className='mx-auto w-fit p-5'>
        <Plot
          data={graphData && graphData.map((gData) => {
            return {
              name: `${gData.property}:${gData.value}`,
              type: 'scatter',
              mode: 'lines+markers',
              x: gData.x,
              y: gData.y,
              connectgaps: true,
            };
          })}
          layout={{ width: 800, height: 300, title: 'Most Frequent Properties' }}
        />
    </div>
      
    </>
  )
}