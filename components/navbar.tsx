'use client';

import React from 'react';
import Link from 'next/link';
import { Limelight } from 'next/font/google';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

import Login from '@/components/login';

const limelight = Limelight({
  subsets: ['latin'],
  weight: ['400'],
});

export default function Navbar() {
  const { data: session } = useSession();

  function blurElement(e: React.MouseEvent<HTMLAnchorElement>) {
    e.currentTarget.blur();
  }

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
          <nav className='ml-12 text-slate-200' aria-label='Main navigation'>
            <div className='mr-4 flex h-full justify-end md:hidden'>
              <div className='dropdown-bottom dropdown dropdown-end mx-2 my-auto w-14'>
                <button aria-haspopup='true' aria-label='Open menu'>
                  <Image
                    src='/images/menu_icon.svg'
                    className='invert'
                    alt='Menu icon'
                    width={50}
                    height={50}
                  />
                </button>
                <ul
                  tabIndex={0}
                  className='dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow'
                >
                  <li>
                    <Link href='/browse' onClick={blurElement}>
                      Browse
                    </Link>
                  </li>
                  <li>
                    <Link href='/search' onClick={blurElement}>
                      Search
                    </Link>
                  </li>
                  <li>
                    <Link href='/chat' onClick={blurElement}>
                      Chat
                    </Link>
                  </li>
                  <li>
                    <Link href='/community' onClick={blurElement}>
                      Community
                    </Link>
                  </li>
                  <li>
                    <Link href='/mySaved' onClick={blurElement}>
                      Saved
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className={`${limelight.className} ml-auto mt-auto hidden h-full max-w-3xl items-end gap-x-8 md:flex md:text-lg lg:text-2xl`}
            >
              <div className='flex-auto text-center'>
                <Link href='/browse'>Browse</Link>
              </div>
              <div className='flex-auto text-center'>
                <Link href='/search'>Search</Link>
              </div>
              <div className='flex-auto text-center'>
                <Link href='/chat'>Chat</Link>
              </div>
              <div className='flex-auto text-center'>
                <Link href='/community'>Community</Link>
              </div>
              {session && session.user && (
                <div className='flex-auto text-center'>
                  <Link href='/mySaved'>Saved</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
