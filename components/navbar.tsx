import Link from "next/link";


export default function Navbar() {
  return (
    <nav className="flex border-b-4 border-black h-16">
      <div className='w-1/3'>
        Logo
      </div>
      <div className='w-2/3 max-w-md flex mt-auto ml-auto'>
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