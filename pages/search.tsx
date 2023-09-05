import Image from "next/image";
import React, { useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import { JournalEntry } from "@prisma/client";
import JournalEntryBox from "@/components/journalEntryBox";
import Pagination from "@etchteam/next-pagination";
import { useRouter } from "next/router";
import Head from "next/head";

type SearchResult = {
  date: string;
  text: string;
}

type SearchResultsRange = {
  startIndex: number;
  endIndex: number;
}

export default function Search() {
  const searchBox = useRef<HTMLInputElement>(null);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult>();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const journalEntryBox = useRef<HTMLDivElement>(null);
  const [searchResultsRange, setSearchResultsRange] = useState<SearchResultsRange>({ startIndex: 1, endIndex: 5 });
  const router = useRouter();

  const displaySearchResults = searchResults.slice(searchResultsRange.startIndex, searchResultsRange.endIndex);

  useEffect(() => {
      let { page, size } = router.query as { page: string, size: string };
      if (!page) page = '1';
      if (!size) size = '5';
      const pageNum = parseInt(page);
      const sizeNum = parseInt(size);

      const startIndex = (pageNum - 1) * sizeNum;
      const endIndex = startIndex + sizeNum;

    if (startIndex !== searchResultsRange.startIndex || endIndex !== searchResultsRange.endIndex) {
      setSearchResultsRange({ startIndex: startIndex, endIndex: endIndex });
      }
  }, [router.query])

  const handleSearch = useCallback(async () => {
    setSelectedSearchResult(undefined);
    setSelectedEntry(undefined);
    setSearchResults([]);

    setHasSearched(true);
    setSearchIsActive(true);
    await runSearch();
    setSearchIsActive(false);
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key === 'Enter') {
        e.preventDefault();
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
    if (selectedEntry && journalEntryBox.current) {
      journalEntryBox.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedEntry])

  function handleSearchClick(e: React.FormEvent<HTMLElement>) {
    e.preventDefault();
    handleSearch();
  }

  const handleSelectResult = async (selectedSearchResult: SearchResult) => {
    setSelectedSearchResult(selectedSearchResult);

    const dateISO = new Date(selectedSearchResult.date).toISOString();

    try {
      const res = await fetch(`/api/journalEntry?date=${dateISO}`, {
        method: 'GET',
      });
      const entry = await res.json() as JournalEntry;

      setSelectedEntry(entry);
    } catch (error) {
      console.log("Could not find journal entry by date: " + error);
    }
  }

  const runSearch = async () => {
    console.log("running search with query: " + searchBox.current?.value);
    try {
      const res = await fetch('/api/searchEmbeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchBox.current?.value,
          threshold: .78   // determined through experimentation
        })
      })

      const data = await res.json();
      //receive a string of combined entries, each with the form: "Date: ...; Text: ..."
      let entriesCombined = data.results;

      const entries = entriesCombined.split('Date:').slice(1);
      const searchResults: SearchResult[] = []
      entries.forEach((entry: string) => {
        let [date, text] = entry.split('Text:')
        date = date.replace(';', '').trim();
        text = text.trim();
        const searchResult = { date: date, text: text }
        searchResults.push(searchResult);
      })

      console.log('number of search results = ' + searchResults.length);
      console.log('searchResults::');
      console.log(searchResults);
      setSearchResults(searchResults);
    } catch (error) {
      console.error(error);
    }
  };

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
      <main>
        <section className="max-w-7xl h-fit mx-auto">
          <form className={"flex flex-col w-1/2 max-w-xl h-fit m-10 mx-auto"} role="search">
            <div className="flex h-10 w-full">
              <button className="border-2 border-slate-200 w-10 flex align-middle justify-center hover:cursor-pointer" onClick={handleSearchClick} aria-label="Search">
                <Image src='/images/search-icon.svg' className="invert p-1" height={30} width={30} alt="search-icon" />
              </button>
              <div className="flex-auto">
                <input ref={searchBox} className="w-full h-full p-4 text-lg text-black placeholder:italic bg-slate-200" type="search" placeholder="Search.." aria-label="Search input" />
              </div>
            </div>
          </form>
        </section>
        {hasSearched &&
          <section className="text-center text-2xl italic" aria-live="polite">
            {searchIsActive &&
              <p>Loading Entries...</p>
            }
            {!searchIsActive && searchResults.length > 0 &&
              <p>{`Found ${searchResults.length} Journal Entries`}</p>
            }
            {!searchIsActive && searchResults.length === 0 &&
              <p>Found 0 Results</p>
            }
          </section>
        }
        <section className="flex flex-col lg:flex-row justify-center align-middle" aria-label="Search results and selected entry">
          {displaySearchResults.length > 0 && (
            <div className="flex flex-col w-full md:w-4/5 mx-auto lg:w-1/2 lg:mr-4 h-fit border-2 border-slate-400" aria-label="Search results">
              {displaySearchResults.map((result, i) => {
                return (
                  <div key={i}>
                    <div className={"border border-slate-400 m-3 p-3 hover:cursor-pointer" + (selectedSearchResult?.date === result.date ? ' border-4 bg-slate-700' : '')} onClick={e => handleSelectResult(result)}>
                      <div className="italic">
                        {result.date}
                      </div>
                      <div className="pl-2">
                        {result.text.slice(0, 100) + '...'}
                      </div>
                    </div>
                  </div>
                )
              })}
              {displaySearchResults && displaySearchResults.length > 0 &&
                <Pagination total={searchResults.length} sizes={[5, 10, 20, 50, 100]} />
              }
            </div>
          )}
          <div className="w-full md:w-3/4 lg:w-1/2 min-h-screen mx-auto mt-8 lg:mt-0" ref={journalEntryBox} aria-label="Selected entry">
            {selectedEntry && (
              <JournalEntryBox {...selectedEntry} />
            )}
          </div>
        </section>
      </main>

    </>
  )
}