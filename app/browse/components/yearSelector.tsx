'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const yearsIncluded = ['1944', '1945', '1946', '1947', '1948'];

export default function YearSelector() {
  const [currentYear, setCurrentYear] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (currentYear === '') handleYearChange(yearsIncluded[0]);
  }, []);

  useEffect(() => {
    const year = searchParams.get('year');
    if (year && !currentYear) {
      setCurrentYear(year);
      return;
    }
  }, [currentYear, searchParams]);

  function handleYearChange(year: string) {
    setCurrentYear(year);

    const params = new URLSearchParams(searchParams);
    params.set('year', year);
    params.delete('month');
    params.delete('day');
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className='mt-12 flex justify-center' aria-label='Year navigation'>
      {yearsIncluded.map((year, i) => {
        return (
          <div className='tabs tabs-boxed' key={i}>
            <button
              className={`tab tab-lg ${
                year === currentYear ? 'tab-active' : ''
              }`}
              onClick={(e) => handleYearChange(year)}
              aria-label={`Year ${year}`}
            >
              {year}
            </button>
          </div>
        );
      })}
    </div>
  );
}
