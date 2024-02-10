import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { JournalEntry } from '@prisma/client';

import { SearchResult, SearchResultsRange } from '@/types/search';
import Pagination from '@/components/pagination';
import JournalEntryBox from '@/components/journalEntryBox';

export default function SearchResults() {
  const [selectedSearchResult, setSelectedSearchResult] =
    useState<SearchResult>();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchResultsRange, setSearchResultsRange] =
    useState<SearchResultsRange>({ startIndex: 1, endIndex: 5 });
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry>();
  const journalEntryBox = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const displaySearchResults = results.slice(
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

  useEffect(() => {
    if (selectedEntry && journalEntryBox.current) {
      journalEntryBox.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedEntry]);

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

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    const fetchResults = async () => {
      try {
        const res = await fetch('/api/searchEmbeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: decodeURI(query),
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

        setResults(searchResults);
      } catch (error) {
        console.error(error);
        setResults([]); // Handle errors appropriately
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchResults();
  }, [query]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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
            <Pagination total={results.length} />
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
      {/* {hasSearched && (
        <section className='text-center text-2xl italic' aria-live='polite'>
          {searchIsActive && <p>Loading Entries...</p>}
          {!searchIsActive && (
            <p>{`Found ${searchResults.length} Journal Entries`}</p>
          )}
        </section>
      )} */}
    </section>
  );
}
