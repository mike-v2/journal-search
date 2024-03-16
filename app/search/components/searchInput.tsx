'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { useQueryString } from '@/hooks/useQueryString';
import { Input } from '@/components/input';

export default function SearchInput() {
  const [searchInput, setSearchInput] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { createQueryString } = useQueryString();

  // TODO: initialize input value to url on component mount

  function handleSubmitSearch(e: React.FormEvent<HTMLElement>) {
    e.preventDefault();
    const queryString = createQueryString(
      'query',
      encodeURIComponent(searchInput),
    );
    router.push(`${pathname}?${queryString}`);
  }

  return (
    <section className='mx-auto h-fit max-w-7xl'>
      <form
        className={'m-10 mx-auto flex h-fit w-1/2 max-w-xl flex-col'}
        role='search'
        onSubmit={handleSubmitSearch}
      >
        <div className='flex w-full'>
          <button
            className='btn flex w-10 justify-center rounded-lg p-0 align-middle hover:cursor-pointer'
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
  );
}
