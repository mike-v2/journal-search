'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Limelight } from 'next/font/google';

import { useSession } from 'next-auth/react';

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

export default function LinksExpanded() {
  const { data: session } = useSession();

  return (
    <>
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
                    <Link
                      href={link.href}
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                        e.currentTarget.blur()
                      }
                    >
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
    </>
  );
}
