'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useQueryString } from '@/hooks/useQueryString';

export default function Pagination({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { createQueryString } = useQueryString();

  const page = searchParams?.get('page') ?? '1';
  const size = searchParams?.get('size') ?? '5';
  const totalPages = Math.ceil(total / Number(size)).toString();

  function setPage(page: string) {
    const queryString = createQueryString('page', page);
    router.push(`${pathname}?${queryString}`);
  }

  return (
    <div className='flex w-fit justify-between gap-2'>
      <button
        className='btn'
        disabled={page === '1'}
        onClick={() => {
          setPage((Number(page) - 1).toString());
        }}
      >
        {'<'}
      </button>

      <div className='my-auto flex w-16 justify-center'>
        {page} / {totalPages}
      </div>

      <button
        className='btn'
        disabled={page === totalPages}
        onClick={() => {
          setPage((Number(page) + 1).toString());
        }}
      >
        {'>'}
      </button>
    </div>
  );
}
