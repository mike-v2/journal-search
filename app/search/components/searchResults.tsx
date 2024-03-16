'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { JournalEntry } from '@prisma/client';

import { SearchResult, SearchResultsRange } from '@/types/search';
import Pagination from '@/components/pagination';
import JournalEntryBox from '@/components/journalEntryBox';
import { useQueryString } from '@/hooks/useQueryString';

export default function SearchResults({
  searchResults,
  selectedEntry,
}: {
  searchResults: SearchResult[];
  selectedEntry?: JournalEntry;
}) {
  const [selectedSearchResult, setSelectedSearchResult] =
    useState<SearchResult>();
  const [searchResultsRange, setSearchResultsRange] =
    useState<SearchResultsRange>({ startIndex: 1, endIndex: 5 });
  const journalEntryBox = useRef<HTMLDivElement>(null);
  const { createQueryString } = useQueryString();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const displaySearchResults = searchResults.slice(
    searchResultsRange.startIndex,
    searchResultsRange.endIndex,
  );

  useEffect(() => {
    const selected = searchParams.get('entry');
    if (selected && !selectedSearchResult) {
      const searchResult = {
        date: selected,
        text: '',
      };
      setSelectedSearchResult(searchResult);
    }
  }, []);

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

  const handleSelectResult = async (selectedSearchResult: SearchResult) => {
    setSelectedSearchResult(selectedSearchResult);

    const queryString = createQueryString(
      'entry',
      encodeURIComponent(selectedSearchResult.date),
    );
    router.replace(`${pathname}?${queryString}`);
  };

  return (
    <section
      className='mx-auto flex max-w-7xl flex-col justify-center px-2 align-middle md:px-8 lg:flex-row'
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
  );
}
