'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function Pagination({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams?.get('page') ?? '1';
  const size = searchParams?.get('size') ?? '5';
  const totalPages = Math.ceil(total / Number(size)).toString();

  return (
    <div className='flex w-fit justify-between gap-2'>
      <button
        className='btn'
        disabled={page === '1'}
        onClick={() => {
          router.push(`?page=${Number(page) - 1}&size=${size}`);
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
          router.push(`?page=${Number(page) + 1}&size=${size}`);
        }}
      >
        {'>'}
      </button>
    </div>
  );
}
