'use client'

import Link from "next/link";
import { Limelight } from "next/font/google";
import Login from "@/components/login";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";

const limelight = Limelight({
  subsets: ['latin'],
  weight: ['400'],
})

export default function Navbar() {
  const { data: session } = useSession();

  function blurElement(e: React.MouseEvent<HTMLAnchorElement>) {
    e.currentTarget.blur();
  }

  return (
    <header className="">
      <div className="flex justify-between border-b-4 border-amber-300 h-24">
        <div className='flex justify-center'>
          <Link href='/' aria-label="Harry Howard Home">
            <Image className='w-auto h-full'
              src='/images/logo.png'
              width={0}
              height={0}
              sizes="100vw"
              alt='Harry Howard Logo'
            />
          </Link>
        </div>
        <div className="flex flex-col justify-between">
          <div className="mr-4">
            <Login></Login>
          </div>
          <nav className="text-slate-200 ml-12" aria-label="Main navigation">
            <div className="flex md:hidden justify-end h-full mr-4">
              <div className="dropdown dropdown-bottom dropdown-end w-14 mx-2 my-auto">
                <button aria-haspopup="true" aria-label="Open menu">
                  <Image src='/images/menu_icon.svg' className='invert' alt='Menu icon' width={50} height={50} />
                </button>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><Link href='/browse' onClick={blurElement}>Browse</Link></li>
                  <li><Link href='/search' onClick={blurElement}>Search</Link></li>
                  <li><Link href='/chat' onClick={blurElement}>Chat</Link></li>
                  <li><Link href='/community' onClick={blurElement}>Community</Link></li>
                  <li><Link href='/mySaved' onClick={blurElement}>Saved</Link></li>
                </ul>
              </div>
            </div>
            <div className={`${limelight.className} hidden md:flex items-end gap-x-8 h-full max-w-3xl mt-auto ml-auto md:text-lg lg:text-2xl`}>
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
              {session && session.user &&
                <div className="flex-auto text-center">
                  <Link href='/mySaved'>Saved</Link>
                </div>
              }
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}