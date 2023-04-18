import SearchResult from "@/components/search-result";
import { SearchResultData } from "@/components/searchResultData";
import Image from "next/image";
import React from "react";
import { useEffect, useRef, useState } from "react";



const exampleSearchResult: SearchResultData = {
  topic: "Family",
  summary: "met Sharon's husband",
  date: "4-1-1948",
  text: "[Complete text of entry]"
}

type FilterTags = {
  People: string[];
  Places: string[];
  Things: string[];
  Organizations: string[];
  Emotions: string[];
  Mood: string[];
  Sentiment: never[];
  [key: string]: string[]; // Add index signature
};

const searchFilterTags: FilterTags = {
  People: ["Grace", "Sharon"],
  Places: ["Post Office", "Temple"],
  Things: ["Journal"],
  Organizations: ["Sunday School", "CB&Q"],
  Emotions: ["Happy", "Sad", "Worried"],
  Mood: ["Descriptive"],
  Sentiment: [],
}

interface Filter {
  People?: String;
  Places?: String;
  Things?: String;
  Organizations?: String;
  Emotions?: String;
  Mood?: String;
  Sentiment?: Number;
  [key: string]: string | String | Number | null | undefined; // Add index signature
}

export default function Search() {
  const searchBox = useRef<HTMLInputElement>(null);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResultData>();
  const [activeFilters, setActiveFilters] = useState<String[]>([]);
  const [searchTags, setSearchTags] = useState<Filter>({});

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    //e.currentTarget.value
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (searchBox.current) {
      console.log("selected Result = " + selectedResult);
      setSearchIsActive(true);
    }
  }

  const handleSelectResult = (data: SearchResultData) => {
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

    if (searchTags.hasOwnProperty(filter)) {
      if (searchTags[filter] !== filterValue) {
        console.log("changing existing value")
        const newTags = { ...searchTags, [filter]: filterValue };
        setSearchTags(newTags);
      } else {
        console.log("deleting existing value")
        const newTags = { ...searchTags };
        delete newTags[filter];
        setSearchTags(newTags);
      }
    } else {
      console.log("Creating new value");
      const newTags = { ...searchTags, [filter]: filterValue };
      setSearchTags(newTags);
    }
  }

  useEffect(() => {
    if (searchBox.current) {
      console.log("search tags changed.")
      let text = "";
      for (const prop in searchTags) {
        console.log("search tag = " + prop);
        text = text.concat(prop + ":" + searchTags[prop] + " ");
      }

      searchBox.current.value = text;
    }
  }, [searchTags])

  return (
    <>
      <form onSubmit={handleSearch} className="flex h-60">
        <div className="flex flex-col w-1/3 max-w-lg h-60 m-10 mx-auto">
          <div className="flex h-10 w-full">
            <div className="border-2 border-black w-10 flex align-middle justify-center">
              <Image src='/images/search-icon.svg' height={25} width={25} alt="search-icon" />
            </div>
            <div className="flex-auto border-2 border-black">
              <label htmlFor="search"></label>
              <input ref={searchBox} onChange={handleSearchChange} className="w-full h-full p-4 text-lg" type="text" id="search" name="search" placeholder="Search.." />
            </div>
          </div>
          <div className="flex flex-wrap ms-10 my-3">
            {Object.keys(searchFilterTags).map((filter) => {
              return (
                activeFilters.includes(filter) === false &&

                <div className="flex-initial h-10 border border-black m-1 p-1" onClick={handleFilterClick} key={filter}>
                  {filter}
                </div>
              )
            })}
            <div className="flex-break h-6"></div>
            {Object.keys(searchFilterTags).map((filter) => {
              return (
                activeFilters.includes(filter) &&
                <React.Fragment key={filter}>
                  <div className="flex-initial h-10 bg-slate-500 border border-black m-1 p-1" onClick={handleFilterClick} key={filter}>
                    {filter}
                  </div>
                  <div className="flex-break h-1" key={`${filter}-top-break`}></div>
                  <div className="flex">
                    {searchFilterTags[filter].map((filterValue) => {
                      return (
                        <div className="flex-initial p-1" onClick={handleFilterValueClick} key={`${filter}-${filterValue}.replace(" ", "")`} data-filter={`${filter}-${filterValue}`} >
                          {filterValue}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex-break h-6" key={`${filter}-bottom-break`}></div>
                </ React.Fragment>
              )
            })}
            
          </div>
        </div>
        {searchIsActive && (
          <div className="flex-auto flex flex-col w-1/3 max-w-lg mx-auto m-10 border-2 border-black">
            <SearchResult {...exampleSearchResult} handleSelectResult={handleSelectResult} />
            <SearchResult {...exampleSearchResult} handleSelectResult={handleSelectResult} />
            <SearchResult {...exampleSearchResult} handleSelectResult={handleSelectResult} />
          </div>
        )
        }
        {searchIsActive && (
          <div className="w-1/3 m-5 border-2 border-black">
            {selectedResult && selectedResult.text}
          </div>
        )}

      </form>
    </>
  )
}