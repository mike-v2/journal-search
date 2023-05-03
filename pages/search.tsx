import SearchResult from "@/components/search-result";
import { AnalysisEntry } from "@/components/analysisEntryType";
import Image from "next/image";
import React from "react";
import { useEffect, useRef, useState } from "react";

const exampleSearchResult: AnalysisEntry = {
  topic: "Family",
  summary: "met Sharon's husband",
  date: "4-1-1948",
  text: "[Complete text of entry]"
}

type FilterStrings = {
  people?: string[];
  places?: string[];
  things?: string[];
  organizations?: string[];
  emotions?: string[];
  mood?: string[];
  [key: string]: string[] | undefined | null; // Add index signature
};

type FilterNumbers = {
  sentiment: number;
}

const filterStringsPredefined: FilterStrings = {
  people: ["Grace", "Sharon"],
  places: ["Post Office", "Temple"],
  things: ["Journal"],
  organizations: ["Sunday School", "CB&Q"],
  emotions: ["happy", "Sad", "Worried"],
  mood: ["Descriptive"],
}

const filterNumbersPredefined: FilterNumbers = {
  sentiment: .5,
}

export default function Search() {
  const searchBox = useRef<HTMLInputElement>(null);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisEntry>();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeFilterStrings, setActiveFilterStrings] = useState<FilterStrings>({});
  const [customFilterStrings, setCustomFilterStrings] = useState<FilterStrings>({});
  const [searchResults, setSearchResults] = useState<[]>([]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (searchBox.current) {
        console.log("Searching: " + e.currentTarget.value);
        setSearchIsActive(true);
        runElasticSearch();
      }
    }
  }

  const handleSelectResult = (data: AnalysisEntry) => {
    console.log(data);
    setSelectedResult(data);
  }

  const handleFilterClick = (e: React.FormEvent<HTMLDivElement>) => {
    const filter = e.currentTarget.textContent;
    if (filter == null || filter === "") return;

    if (activeFilters.includes(filter)) {
      console.log("removing filter: " + filter);
      //activeFilters.splice(activeFilters.indexOf(filter), 1);
      const updatedActiveFilters = activeFilters.filter((activeFilter) => activeFilter !== filter);
      setActiveFilters(updatedActiveFilters);
    } else {
      console.log("adding filter: " + filter);
      setActiveFilters([...activeFilters, filter])
    }
  }

  const handleFilterValueClick = (e: React.FormEvent<HTMLDivElement>) => {
    const filterValue = e.currentTarget.textContent;
    const filter = e.currentTarget.getAttribute('data-filter')?.split('-')[0];
    console.log("filter: " + filter + "  filterValue: " + filterValue);
    if (filter == null) return;
    if (filterValue == null) return;

    if (activeFilterStrings.hasOwnProperty(filter)) {
      if (activeFilterStrings[filter]?.includes(filterValue) === false) {
        //console.log("updating existing filter category")
        const newFilterStrings = { ...activeFilterStrings };
        newFilterStrings[filter]?.push(filterValue);
        setActiveFilterStrings(newFilterStrings);
      } else {
        //console.log("deleting existing value")
        const newFilterStrings = { ...activeFilterStrings };

        const index = newFilterStrings[filter]?.indexOf(filterValue);
        if (index !== undefined && index > -1) {
          newFilterStrings[filter]?.splice(index, 1);
        }

        setActiveFilterStrings(newFilterStrings);
      }
    } else {
      //console.log("Creating new value");
      const newFilterStrings = { ...activeFilterStrings, [filter]: [filterValue] };
      setActiveFilterStrings(newFilterStrings);
    }
  }

  /* useEffect(() => {
    if (searchBox.current) {
      console.log("search tags changed.")
      let text = "";
      for (const prop in searchTags) {
        console.log("search tag = " + prop);
        text = text.concat(prop + ":" + searchTags[prop] + " ");
      }

      searchBox.current.value = text;
    }
  }, [searchTags]) */

  const handleCustomFilterSubmit = (e: React.KeyboardEvent<HTMLInputElement>, filter: string) => {
    if (e.key === 'Enter') {
      const newCustomString = e.currentTarget.value;

      if (customFilterStrings.hasOwnProperty(filter)) {
        if (customFilterStrings[filter]?.includes(newCustomString)) return;

        const newFilterStrings = { ...customFilterStrings };
        newFilterStrings[filter]?.push(newCustomString);
        setCustomFilterStrings(newFilterStrings)
      } else {
        const newFilterStrings = { ...customFilterStrings, [filter]: [newCustomString] };
        setCustomFilterStrings(newFilterStrings)
      }
    }
  }

  const handleCustomFilterRemove = (e: React.MouseEvent<HTMLButtonElement>, filter: string, filterValue: string) => {
    if (customFilterStrings.hasOwnProperty(filter)) {
      if (customFilterStrings[filter]?.includes(filterValue)) {
        const newCustomStrings = { ...customFilterStrings };

        const index = newCustomStrings[filter]?.indexOf(filterValue);
        if (index !== undefined && index > -1) {
          newCustomStrings[filter]?.splice(index, 1);
        }

        setCustomFilterStrings(newCustomStrings);
      }
    }
  }

  function convertTimestampToDate(timestamp: string) {
    let date = timestamp.split('T')[0];
    const [year, month, day] = date.split('-')
    return `${month}-${day}-${year}`;
  }

  const runElasticSearch = async () => {
    
    const searchTerms = getSearchTerms();
    console.log("searching for terms: ");
    console.log(searchTerms);

    const {date, text, people, places, things, organizations, emotions, moods} = searchTerms;

    let apiString = '/api/elasticClient?'
    if (date && date !== '') {
      apiString = apiString.concat(`date=${date}&`);
    }
    if (text && text.length > 0) {
      apiString = apiString.concat(`text=${text}&`);
    }
    if (people && people.length > 0) {
      apiString = apiString.concat(`people=${people}&`);
    }
    if (places && places.length > 0) {
      apiString = apiString.concat(`places=${places}&`);
    }
    if (things && things.length > 0) {
      apiString = apiString.concat(`things=${things}&`);
    }
    if (organizations && organizations.length > 0) {
      apiString = apiString.concat(`organizations=${organizations}&`);
    }
    if (emotions && emotions.length > 0) {
      apiString = apiString.concat(`emotions=${emotions}&`);
    }
    if (moods && moods.length > 0) {
      apiString = apiString.concat(`moods=${moods}&`);
    }

    try {
      const res = await fetch(apiString);
      const data = await res.json();

      if (res.ok) {
        console.log(data);
        const analyses = [];
        data.map((d) => {
          const analysis = d._source;
          analysis["date"] = convertTimestampToDate(analysis["@timestamp"]);
          delete analysis["@timestamp"];
          analyses.push(d._source);
        })
        setSearchResults(analyses);
        console.log(`display search results:`)
        console.log(analyses)
      } else {
        console.log(`Error getting search results: ${data}`);
      }
    } catch (error) {
      console.log(`Error accessing search api: ${error}`);
    }
  };

  function getSearchTerms() {
    const terms = { };

    const date = '01-01-1930:01-01-1950'
    terms["date"] = date;

    const text = searchBox.current?.value.split(' ');
    terms["text"] = text;

    for (const prop in filterStringsPredefined) {
      const value = []
      if (activeFilterStrings.hasOwnProperty(prop) && activeFilterStrings[prop])
        value.push(...activeFilterStrings[prop]);
      if (customFilterStrings.hasOwnProperty(prop) && customFilterStrings[prop])
        value.push(...customFilterStrings[prop]);

      terms[prop] = value;
    }

    return terms;
  }

  return (
    <>
      <form className="flex max-w-7xl h-60 min-h-screen mx-auto">
        <div className={"flex flex-col w-1/3 max-w-lg h-60 m-10 " + (searchIsActive ? 'mx-5' : 'mx-auto')}>
          <div className="flex h-10 w-full">
            <div className="border-2 border-black w-10 flex align-middle justify-center">
              <Image src='/images/search-icon.svg' height={25} width={25} alt="search-icon" />
            </div>
            <div className="flex-auto border-2 border-black">
              <input ref={searchBox} onKeyDown={handleSearchKeyDown} className="w-full h-full p-4 text-lg" type="text" placeholder="Search.." />
            </div>
          </div>
          <div className="flex flex-wrap ms-10 my-3">
            {Object.keys(filterStringsPredefined).map((filter) => {
              return (
                activeFilters.includes(filter) === false &&

                <div className="flex-initial h-10 border border-black m-1 p-1 hover:cursor-pointer" onClick={handleFilterClick} key={filter}>
                  {filter}
                </div>
              )
            })}

            <div className="flex-break h-3"></div>


            {activeFilters.slice(0).reverse().map((filter) => {
              return (
                <React.Fragment key={filter}>
                  <div className="flex-initial h-10 bg-slate-500 border border-black  p-1 hover:cursor-pointer" onClick={handleFilterClick}>
                    {filter}
                  </div>
                  
                  <div className="flex-break"></div>

                  <div className="flex flex-wrap max-w-full">
                    {filterStringsPredefined[filter]?.map((filterValue) => {
                      return (
                        <div className={" hover:cursor-pointer px-2 py-1 m-1" + (activeFilterStrings.hasOwnProperty(filter) && activeFilterStrings[filter]?.includes(filterValue) ? ' bg-amber-300' : '')} onClick={handleFilterValueClick} key={`${filter}-${filterValue}`} data-filter={`${filter}-${filterValue}`} >
                          {filterValue}
                        </div>
                      )
                    })}
                    {customFilterStrings[filter]?.map((filterValue) => {
                      return (
                        <div className="flex m-1" key={`${filter}-${filterValue}`}>
                          <span className="bg-amber-300 px-1 border-4 border-slate-400 rounded-r-md my-auto">
                            {filterValue}
                          </span>
                          <button type="button" className="bg-amber-300 px-1 border-4 border-slate-400 rounded-md text-black" onClick={(e) => handleCustomFilterRemove(e, filter, filterValue)}>
                            &#215;
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <input type="text" className="mt-2 mx-1" onKeyDown={(e) => handleCustomFilterSubmit(e, filter)}></input>

                  <div className="flex-break h-6"></div>
                </ React.Fragment>
              )
            })}
            
          </div>
        </div>
        {searchIsActive && (
          <div className="flex-auto flex flex-col max-w-lg h-fit m-10 mx-5 border-2 border-black">
            {searchResults && searchResults.map((result) => {
            return <SearchResult topic={result.topic} date={result.date} summary={result.summary} text='' handleSelectResult={handleSelectResult} key={result.summary.slice(0,15)} />
            })}
          </div>
        )
        }
        {searchIsActive && (
          <div className="w-1/3 m-10 mx-5 border-2 border-black">
            {selectedResult && Object.keys(selectedResult).map((key) => {
              if (typeof selectedResult[key] === 'function') {
                return null;
              }
              return <div key={key}>{key}: {selectedResult[key]}</div>;
            })}
          </div>
        )}

      </form>
    </>
  )
}