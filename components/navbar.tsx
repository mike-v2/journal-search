import Link from "next/link";
import { Limelight } from "next/font/google";
import Login from "@/pages/login";
import { useSession } from "next-auth/react";

const limelight = Limelight({
  subsets: ['latin'],
  weight: ['400'],
})

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <>
      <div>
        <Login></Login>
      </div>
      <nav className="flex border-b-4 border-amber-300 h-16 text-slate-200">
        <div className='basis-1/5'>
          Logo
        </div>
        <div className={`${limelight.className} flex basis-4/5 max-w-2xl mt-auto ml-auto text-2xl`}>
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
          <div className="flex-auto text-center">Saved</div>
          }
        </div>
      </nav>
    </>
  )
}