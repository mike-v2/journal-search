'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { useQueryString } from '@/hooks/useQueryString';
import { Input } from '@/components/input';

import SearchResults from '@/app/search/searchResults';

export default function Search() {
  const [searchInput, setSearchInput] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { createQueryString } = useQueryString();

  function handleSubmitSearch(e: React.FormEvent<HTMLElement>) {
    e.preventDefault();
    const queryString = createQueryString('query', encodeURI(searchInput));
    router.push(`${pathname}?${queryString}`);
  }

  return (
    <main>
      <section className='mx-auto h-fit max-w-7xl'>
        <form
          className={'m-10 mx-auto flex h-fit w-1/2 max-w-xl flex-col'}
          role='search'
          onSubmit={handleSubmitSearch}
        >
          <div className='flex w-full'>
            <button
              className='flex w-10 justify-center rounded-lg border-2 border-slate-200 align-middle hover:cursor-pointer'
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
                type='search'
                placeholder='Search..'
                aria-label='Search input'
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </form>
      </section>

      <SearchResults />
    </main>
  );
}
