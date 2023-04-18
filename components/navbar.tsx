import Link from "next/link";
import { Limelight } from "next/font/google";

const limelight = Limelight({
  subsets: ['latin'],
  weight: ['400'],
})

export default function Navbar() {
  return (
    <nav className="flex border-b-4 border-black h-16">
      <div className='w-1/3'>
        Logo
      </div>
      <div className={`${limelight.className} w-2/3 max-w-md flex mt-auto ml-auto text-lg`}>
        <div className='flex-auto text-center'>
          <Link href='/'>Home</Link>
        </div>
        <div className='flex-auto text-center'>Browse</div>
        <div className='flex-auto text-center'>
          <Link href='/search'>Search</Link>
        </div>
        <div className='flex-auto text-center'>Community</div>
      </div>
    </nav>
  )
}