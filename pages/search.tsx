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

type FilterStrings = {
  People?: string[];
  Places?: string[];
  Things?: string[];
  Organizations?: string[];
  Emotions?: string[];
  Mood?: string[];
  [key: string]: string[] | undefined | null; // Add index signature
};

type FilterNumbers = {
  Sentiment: number;
}

const filterStringsPredefined: FilterStrings = {
  People: ["Grace", "Sharon"],
  Places: ["Post Office", "Temple"],
  Things: ["Journal"],
  Organizations: ["Sunday School", "CB&Q"],
  Emotions: ["Happy", "Sad", "Worried"],
  Mood: ["Descriptive"],
}

const filterNumbersPredefined: FilterNumbers = {
  Sentiment: .5,
}

export default function Search() {
  const searchBox = useRef<HTMLInputElement>(null);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResultData>();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeFilterStrings, setActiveFilterStrings] = useState<FilterStrings>({});
  const [customFilterStrings, setCustomFilterStrings] = useState<FilterStrings>({});

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchBox.current) {
        console.log("Searching: " + e.currentTarget.value);
        setSearchIsActive(true);
      }
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

  const handleCustomTagSubmit = (e: React.KeyboardEvent<HTMLInputElement>, filter: string) => {
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

  const handleCustomStringRemove = (e: React.MouseEvent<HTMLButtonElement>, filter: string, filterValue: string) => {
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
                          <button type="button" className="bg-amber-300 px-1 border-4 border-slate-400 rounded-md text-black" onClick={(e) => handleCustomStringRemove(e, filter, filterValue)}>
                            &#215;
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <input type="text" className="mt-2 mx-1" onKeyDown={(e) => handleCustomTagSubmit(e, filter)}></input>

                  <div className="flex-break h-6"></div>
                </ React.Fragment>
              )
            })}
            
          </div>
        </div>
        {searchIsActive && (
          <div className="flex-auto flex flex-col max-w-lg h-fit m-10 mx-5 border-2 border-black">
            <SearchResult {...exampleSearchResult} handleSelectResult={handleSelectResult} />
            <SearchResult {...exampleSearchResult} handleSelectResult={handleSelectResult} />
            <SearchResult {...exampleSearchResult} handleSelectResult={handleSelectResult} />
          </div>
        )
        }
        {searchIsActive && (
          <div className="w-1/3 m-10 mx-5 border-2 border-black">
            {selectedResult && selectedResult.text}
          </div>
        )}

      </form>
    </>
  )
}