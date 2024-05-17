import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import Login from '@/components/login';
import Links from '@/app/home.components/navbar/links';

export default function Navbar() {
  return (
    <header>
      <div className='flex h-24 justify-between border-b-4 border-amber-300'>
        <div className='flex justify-center'>
          <Link href='/' aria-label='Harry Howard Home'>
            <Image
              className='h-full w-auto'
              src='/images/logo.png'
              width={0}
              height={0}
              sizes='100vw'
              alt='Harry Howard Logo'
            />
          </Link>
        </div>
        <div className='flex flex-col justify-between'>
          <div className='mr-4'>
            <Login></Login>
          </div>
          <nav className='text-slate-200' aria-label='Main navigation'>
            <Links />
          </nav>
        </div>
      </div>
    </header>
  );
}
