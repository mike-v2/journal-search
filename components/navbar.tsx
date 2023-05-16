import Link from "next/link";
import { Limelight } from "next/font/google";
import Login from "@/pages/login";
import { useSession } from "next-auth/react";
import Image from "next/image";

const limelight = Limelight({
  subsets: ['latin'],
  weight: ['400'],
})

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <>
      <div className="flex">
        <div className='relative basis-1/5 ml-5'>
          <Image src='/images/logo.png' className="absolute top-0 left-0" width={400} height={400} alt='Harry Howard Logo' />
        </div>
        <div className="basis-4/5">
          <Login></Login>
          <nav className="border-b-4 border-amber-300 h-16 text-slate-200">
            <div className={`${limelight.className} flex items-end h-full max-w-2xl mt-auto ml-auto md:text-lg lg:text-2xl`}>
              <div className='flex-auto text-center'>
                <Link href='/'>Home</Link>
              </div>
              <div className='flex-auto text-center'>
                <Link href='/browse'>Browse</Link>
              </div>
              <div className='flex-auto text-center'>
                <Link href='/search'>Search</Link>
              </div>
              <div className='flex-auto text-center'>
                <Link href='/'>Community</Link>
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
    </>
  )
}