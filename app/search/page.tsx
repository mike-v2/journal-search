'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { JournalEntry } from '@prisma/client';

import Pagination from '@/components/pagination';
import JournalEntryBox from '@/components/journalEntryBox';
import { Input } from '@/components/input';

type SearchResult = {
  date: string;
  text: string;
};

type SearchResultsRange = {
  startIndex: number;
  endIndex: number;
};

export default function Search() {
  const searchBox = useRef<HTMLInputElement>(null);
  const [searchIsActive, setSearchIsActive] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] =
    useState<SearchResult>();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const journalEntryBox = useRef<HTMLDivElement>(null);
  const [searchResultsRange, setSearchResultsRange] =
    useState<SearchResultsRange>({ startIndex: 1, endIndex: 5 });
  const searchParams = useSearchParams();

  const displaySearchResults = searchResults.slice(
    searchResultsRange.startIndex,
    searchResultsRange.endIndex,
  );

  useEffect(() => {
    const page = searchParams?.get('page') ?? '1';
    const size = searchParams?.get('size') ?? '5';
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);

    const startIndex = (pageNum - 1) * sizeNum;
    const endIndex = startIndex + sizeNum;

    if (
      startIndex !== searchResultsRange.startIndex ||
      endIndex !== searchResultsRange.endIndex
    ) {
      setSearchResultsRange({ startIndex, endIndex });
    }
  }, [searchParams, searchResultsRange]);

  const handleSearch = useCallback(async () => {
    setSelectedSearchResult(undefined);
    setSelectedEntry(undefined);
    setSearchResults([]);

    setHasSearched(true);
    setSearchIsActive(true);
    await runSearch();
    setSearchIsActive(false);
  }, []);

  useEffect(() => {
    if (selectedEntry && journalEntryBox.current) {
      journalEntryBox.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedEntry]);

  function handleSubmitSearch(e: React.FormEvent<HTMLElement>) {
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
      const entry = (await res.json()) as JournalEntry;

      setSelectedEntry(entry);
    } catch (error) {
      console.log('Could not find journal entry by date: ' + error);
    }
  };

  const runSearch = async () => {
    console.log('running search with query: ' + searchBox.current?.value);
    try {
      const res = await fetch('/api/searchEmbeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchBox.current?.value,
          threshold: 0.78, // determined through experimentation
        }),
      });

      const data = await res.json();
      //receive a string of combined entries, each with the form: "Date: ...; Text: ..."
      let entriesCombined = data.results;

      const entries = entriesCombined.split('Date:').slice(1);
      const searchResults: SearchResult[] = [];
      entries.forEach((entry: string) => {
        let [date, text] = entry.split('Text:');
        date = date.replace(';', '').trim();
        text = text.trim();
        const searchResult = { date: date, text: text };
        searchResults.push(searchResult);
      });

      console.log('number of search results = ' + searchResults.length);
      console.log('searchResults::');
      console.log(searchResults);
      setSearchResults(searchResults);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <section className='mx-auto h-fit max-w-7xl'>
        <form
          className={'m-10 mx-auto flex h-fit w-1/2 max-w-xl flex-col'}
          role='search'
          onSubmit={handleSubmitSearch}
        >
          <div className='flex h-10 w-full'>
            <button
              className='flex w-10 justify-center border-2 border-slate-200 align-middle hover:cursor-pointer'
              onClick={handleSubmitSearch}
              aria-label='Search'
            >
              <Image
                src='/images/search-icon.svg'
                className='p-1 invert'
                height={30}
                width={30}
                alt='search-icon'
              />
            </button>
            <div className='flex-auto'>
              <Input
                ref={searchBox}
                type='search'
                placeholder='Search..'
                aria-label='Search input'
              />
            </div>
          </div>
        </form>
      </section>
      {hasSearched && (
        <section className='text-center text-2xl italic' aria-live='polite'>
          {searchIsActive && <p>Loading Entries...</p>}
          {!searchIsActive && searchResults.length > 0 && (
            <p>{`Found ${searchResults.length} Journal Entries`}</p>
          )}
          {!searchIsActive && searchResults.length === 0 && (
            <p>Found 0 Results</p>
          )}
        </section>
      )}
      <section
        className='flex flex-col justify-center align-middle lg:flex-row'
        aria-label='Search results and selected entry'
      >
        {displaySearchResults.length > 0 && (
          <div
            className='mx-auto flex h-fit w-full flex-col border-2 border-slate-400 md:w-4/5 lg:mr-4 lg:w-1/2'
            aria-label='Search results'
          >
            {displaySearchResults.map((result, i) => {
              return (
                <div key={i}>
                  <div
                    className={
                      'm-3 border border-slate-400 p-3 hover:cursor-pointer' +
                      (selectedSearchResult?.date === result.date
                        ? ' border-4 bg-slate-700'
                        : '')
                    }
                    onClick={(e) => handleSelectResult(result)}
                  >
                    <div className='italic'>{result.date}</div>
                    <div className='pl-2'>
                      {result.text.slice(0, 100) + '...'}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className='ml-auto'>
              <Pagination total={searchResults.length} />
            </div>
          </div>
        )}
        <div
          className='mx-auto mt-8 min-h-screen w-full md:w-3/4 lg:mt-0 lg:w-1/2'
          ref={journalEntryBox}
          aria-label='Selected entry'
        >
          {selectedEntry && <JournalEntryBox {...selectedEntry} />}
        </div>
      </section>
    </main>
  );
}
