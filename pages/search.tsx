import { Topic } from "@/components/topicType";
import {SearchTerms} from '@/components/searchTermsType'
import Image from "next/image";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { timestampToDate, journalDateToISOString } from "@/utils/convertDate";
import { Josefin_Sans } from "next/font/google";
import { JournalEntry, JournalTopic } from "@prisma/client";
import JournalTopicBox from "@/components/journalTopicBox";
import JournalEntryBox from "@/components/journalEntryBox";
import lunr, { Index } from "lunr";
import Pagination from "@etchteam/next-pagination";
import { useRouter } from "next/router";

const exampleSearchResult: Topic = {
  topic: "Family",
  summary: "met Sharon's husband",
  date: "4-1-1948",
  people: [],
  places: [],
  organizations: [],
  things: [],
  emotion: "",
  mood: "",
  strength: 0
}

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
});

type FilterStrings = {
  people?: string[];
  places?: string[];
  things?: string[];
  organizations?: string[];
  emotions?: string[];
  moods?: string[];
  [key: string]: string[] | undefined | null; // Add index signature
};

type FilterNumbers = {
  sentiment: number;
}

const filterStringsPredefined: FilterStrings = {
  people: ["Grace", "Charles", "Cathy", "Ardie"],
  places: ["Albany", "Rochester", "Chicago", "Denver"],
  things: ["goiter", "cigarettes", "World War I", "Book of Mormon"],
  organizations: ["Church", "Genealogical Society", "LDS", "FHA", "RMS"],
  emotions: ["satisfaction", "hope", "concern", "frustration"],
}

const filterNumbersPredefined: FilterNumbers = {
  sentiment: .5,
}

interface JournalTopicExt extends JournalTopic {
  date: string;
}

export default function Search() {
  const searchBox = useRef<HTMLInputElement>(null);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<JournalTopicExt>();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry>();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeFilterStrings, setActiveFilterStrings] = useState<FilterStrings>({});
  const [customFilterStrings, setCustomFilterStrings] = useState<FilterStrings>({});
  const [searchResults, setSearchResults] = useState<JournalTopicExt[]>([]);
  const journalEntryBox = useRef<HTMLDivElement>(null);
  const [searchIndex, setSearchIndex] = useState<Index>();
  const router = useRouter();
  const [displaySearchResults, setDisplaySearchResults] = useState<JournalTopicExt[]>();

  useEffect(() => {
    if (searchResults) {
      let { page, size } = router.query as { page: string, size: string };
      if (!page) page = '1';
      if (!size) size = '5';
      const pageNum = parseInt(page);
      const sizeNum = parseInt(size);

      const startIndex = (pageNum - 1) * sizeNum;
      const endIndex = startIndex + sizeNum;
      setDisplaySearchResults(searchResults.slice(startIndex, endIndex));
    }
  }, [router.query, searchResults])

  useEffect(() => {
    async function setLunrIndex() {
      try {
        const res = await fetch('/api/journalTopic');
        const documents = await res.json();

        const index = lunr(function () {
          this.ref("id");
          this.field("name");
          this.field("summary");
          this.field("people");
          this.field("places");
          this.field("organizations");
          this.field("things");
          this.field("emotion");

          documents.forEach((doc: Object) => {
            this.add(doc);
          }, this);
        });

        setSearchIndex(index);
      } catch (error) {
        console.log("Could not fetch topics: " + error);
      }
    }

    setLunrIndex();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        //e.preventDefault();
        handleSearch();
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleSearch]);

  useEffect(() => {
    if (selectedTopic && journalEntryBox.current) {
      journalEntryBox.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTopic])

  function handleSearch() {
    if (searchBox.current) {
      setSelectedTopic(undefined);
      setSelectedEntry(undefined);
      setSearchResults([]);
      setDisplaySearchResults(undefined);
      setSearchIsActive(true);
      runSearch();
    }
  }

  const handleSelectResult = async (selectedTopic: JournalTopicExt) => {
    setSelectedTopic(selectedTopic);

    const dateISO = journalDateToISOString(selectedTopic.date);

    try {
      const res = await fetch(`/api/journalEntry?date=${dateISO}`, {
        method: 'GET',
      });

      if (res.status === 200) {
        const entry = await res.json() as JournalEntry;
        if (entry) {
          setSelectedEntry(entry);
        }
      } else if (res.status === 500) {
        const data = await res.json();
        console.log(data.error);
      } else {
        console.log("Could not find journal entry by date");
      }
    } catch (error) {
      console.log("Could not find journal entry by date: " + error);
    }
  }

  const handleFilterClick = (e: React.FormEvent<HTMLDivElement>) => {
    const filter = e.currentTarget.textContent;
    if (filter == null || filter === "") return;

    if (activeFilters.includes(filter)) {
      console.log("removing filter: " + filter);
      //activeFilters.splice(activeFilters.indexOf(filter), 1);
      const updatedActiveFilters = activeFilters.filter((activeFilter) => activeFilter !== filter);
      setActiveFilters(updatedActiveFilters);

      if (activeFilterStrings.hasOwnProperty(filter)) {
        const newActiveFilters = activeFilterStrings;
        delete newActiveFilters[filter];
        setActiveFilterStrings(newActiveFilters);
      }
      if (customFilterStrings.hasOwnProperty(filter)) {
        const newCustomFilters = customFilterStrings;
        delete newCustomFilters[filter];
        setActiveFilterStrings(newCustomFilters);
      }
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

      e.currentTarget.value = '';
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

  const runSearch = async () => {
    
    const searchTerms = getSearchTerms();
    console.log("searching for terms: ");
    console.log(searchTerms);

    const {text, people, places, things, organizations, emotions, moods} = searchTerms;

    /* let apiString = '/api/elasticClient?'
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
    console.log("api string = " + apiString); */

    let searchString = '';
    if (text && text.length > 0) {
      searchString += text + ' ';
    } 
    if (people && people.length > 0) {
      searchString += people.join(' ') + ' ';
    } 
    if (places && places.length > 0) {
      searchString += places.join(' ') + ' ';
    }
    if (things && things.length > 0) {
      searchString += things.join(' ') + ' ';
    } 
    if (organizations && organizations.length > 0) {
      searchString += organizations.join(' ') + ' ';
    } 

    console.log("search string = " + searchString);
    const results = searchIndex?.search(searchString);
    console.log("initial results::");
    console.log(results);
    const topics = [];
    for (const index in results) {
      const topicId = results[parseInt(index)].ref;

      try {
        const res = await fetch(`/api/journalTopic?topicId=${topicId}`)
        const data = await res.json();

        data["date"] = timestampToDate(data.journalEntry.date);

        let name = data["name"];
        name = name.charAt(0).toUpperCase() + name.slice(1);
        data["name"] = name;

        let summary = data["summary"];
        summary = summary.charAt(0).toUpperCase() + summary.slice(1);
        data["summary"] = summary;

        topics.push(data);
      } catch (error) {
        console.log(error);
      }
    }

    setSearchResults(topics);
    /* try {
      const res = await fetch(apiString);
      const data = await res.json();

      if (res.ok) {
        console.log(data);
        const analyses : Topic[] = [];
        data.map((d: any) => {
          const analysis = d._source;
          analysis["date"] = timestampToDate(analysis["@timestamp"]);
          delete analysis["@timestamp"];
          analyses.push(d._source);

          let topic = analysis["topic"];
          topic = topic.charAt(0).toUpperCase() + topic.slice(1);
          analysis["topic"] = topic;

          let summary = analysis["summary"];
          summary = summary.charAt(0).toUpperCase() + summary.slice(1);
          analysis["summary"] = summary;
        })
        setSearchResults(analyses);
        console.log(`display search results:`)
        console.log(analyses)
      } else {
        console.log(`Error getting search results: ${data}`);
      }
    } catch (error) {
      console.log(`Error accessing search api: ${error}`);
    } */
  };

  function getSearchTerms() {
    const terms : SearchTerms = { };

    const date = '01-01-1930:01-01-1950'
    terms["date"] = date;

    const text = searchBox.current?.value.split(' ');
    terms.text = text;

    for (const prop in filterStringsPredefined) {
      const value = []
      if (activeFilterStrings.hasOwnProperty(prop) && activeFilterStrings[prop]) {
        value.push(...activeFilterStrings[prop] as string[]);
      }
      if (customFilterStrings.hasOwnProperty(prop) && customFilterStrings[prop]) {
        value.push(...customFilterStrings[prop] as string[]);
      }

      terms[prop] = value;
    }

    return terms;
  }

  return (
    <>
      <div className="max-w-7xl h-fit mx-auto">
        <div className={"flex flex-col w-1/2 max-w-xl h-fit m-10 mx-auto"}>
          <div className="flex h-10 w-full">
            <div className="border-2 border-slate-200 w-10 flex align-middle justify-center hover:cursor-pointer" onClick={(e) => handleSearch()}>
              <Image src='/images/search-icon.svg' className="invert p-1" height={30} width={30} alt="search-icon" />
            </div>
            <div className="flex-auto">
              <input ref={searchBox} className="w-full h-full p-4 text-lg text-black placeholder:italic bg-slate-200" type="text" placeholder="Search.." />
            </div>
          </div>
          <div className="flex flex-wrap ms-10 my-3">
            {Object.keys(filterStringsPredefined).map((filter) => {
              return (
                activeFilters.includes(filter) === false &&
                <div className={`${josefin.className} flex-initial h-10 text-xl border border-slate-400 rounded-md m-1 p-1 hover:cursor-pointer capitalize`} onClick={handleFilterClick} key={filter}>
                  {filter}
                </div>
              )
            })}

            <div className="flex-break h-3"></div>

            {activeFilters.slice(0).reverse().map((filter) => {
              return (
                <div className="basis-full" key={filter}>
                  <div className="bg-slate-600 rounded-md w-100" >
                    <div className={`${josefin.className} flex-initial h-10 text-xl font-bold text-center text-slate-50 p-1 hover:cursor-pointer capitalize border-b-2 border-slate-800 rounded-md `} onClick={handleFilterClick}>
                      {filter}
                    </div>

                    <div className="flex-break"></div>

                    <div className="flex flex-wrap justify-center max-w-full">
                      {filterStringsPredefined[filter]?.map((filterValue) => {
                        return (
                          <div className={`${josefin.className} hover:cursor-pointer px-2 py-1 m-1 capitalize` + (activeFilterStrings.hasOwnProperty(filter) && activeFilterStrings[filter]?.includes(filterValue) ? ' font-bold text-slate-200' : '')} onClick={handleFilterValueClick} key={`${filter}-${filterValue}`} data-filter={`${filter}-${filterValue}`} >
                            {filterValue}
                          </div>
                        )
                      })}

                      <div className="flex-break"></div>

                      {customFilterStrings[filter]?.map((filterValue) => {
                        return (
                          <div className="flex m-1 p-1" key={`${filter}-${filterValue}`}>
                            <span className="px-1 my-auto italic font-bold text-slate-200">
                              {filterValue}
                            </span>
                            <button type="button" className="px-1 text-white" onClick={(e) => handleCustomFilterRemove(e, filter, filterValue)}>
                              &#215;
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    <input type="text" className="m-2 p-1 text-black placeholder:italic bg-slate-200" placeholder="custom filter..." onKeyDown={(e) => handleCustomFilterSubmit(e, filter)}></input>

                    
                  </ div>
                  <div className="flex-break h-6"></div>
                </div>
                
              )
            })}
            
          </div>
        </div>
      </div>
      <div className="text-center text-2xl italic">
        {searchIsActive && 
          (searchResults && searchResults.length > 0 ?
            `Found ${searchResults.length} Journal Topics` :
            "Loading Topics..."
          )
        }
      </div>
      <div className="flex flex-col lg:flex-row justify-center align-middle">
        {searchIsActive && (
          <div className="flex flex-col w-full md:w-4/5 mx-auto lg:w-1/2 h-fit border-2 border-slate-400">
            {displaySearchResults && displaySearchResults.map((result) => {
              return (
                <JournalTopicBox {...result} handleSelectResult={handleSelectResult} isSelected={selectedTopic?.summary == result.summary} key={result.name + result.summary.slice(0, 25)} />
              )
            })}
            {displaySearchResults && displaySearchResults.length > 0 &&
              <Pagination total={searchResults.length} sizes={[5, 10, 20, 50, 100]} />
            }
          </div>
        )}
        <div className="w-full md:w-3/4 lg:w-1/2 min-h-screen mx-auto mt-8" ref={journalEntryBox}>
          {searchIsActive && selectedEntry && (
            <JournalEntryBox {...selectedEntry} />
          )}
        </div>
      </div>
    </>
  )
}