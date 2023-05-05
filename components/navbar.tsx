import Link from "next/link";
import { Limelight } from "next/font/google";

const limelight = Limelight({
  subsets: ['latin'],
  weight: ['400'],
})

export default function Navbar() {
  return (
    <nav className="flex border-b-4 border-amber-300 h-16 text-slate-200">
      <div className='basis-1/3'>
        Logo
      </div>
      <div className={`${limelight.className} flex basis-2/3 max-w-xl mt-auto ml-auto text-2xl`}>
        <div className='flex-auto text-center'>
          <Link href='/'>Home</Link>
        </div>
        <div className='flex-auto text-center'>
          <Link href='/login'>Browse</Link>
        </div>
        <div className='flex-auto text-center'>
          <Link href='/search'>Search</Link>
        </div>
        <div className='flex-auto text-center'>Community</div>
      </div>
    </nav>
  )
}