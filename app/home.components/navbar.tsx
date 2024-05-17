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

const links = [
  {
    name: 'Browse',
    href: '/browse',
  },
  {
    name: 'Search',
    href: '/search',
  },
  {
    name: 'Chat',
    href: '/chat',
  },
  {
    name: 'Community',
    href: '/community',
  },
  {
    name: 'Saved',
    href: '/mySaved',
    requireLogin: true,
  },
];

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
          <nav className='text-slate-200' aria-label='Main navigation'>
            <div className='mr-4 flex h-full justify-end md:hidden'>
              <div className='dropdown dropdown-end dropdown-bottom mx-2 my-auto w-14'>
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
                  {links &&
                    links.map((link) => {
                      if (link.requireLogin && !session?.user) return null;

                      return (
                        <li key={link.name}>
                          <Link href={link.href} onClick={blurElement}>
                            {link.name}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
            <div
              className={`${limelight.className} ml-auto mt-auto hidden h-full items-end gap-x-12 md:flex md:text-lg lg:text-2xl`}
            >
              {links &&
                links.map((link) => {
                  if (link.requireLogin && !session?.user) return null;

                  return (
                    <div key={link.name} className='flex-auto text-center'>
                      <Link href={link.href}>{link.name}</Link>
                    </div>
                  );
                })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
