import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '../components/navbar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className='bg-slate-800 text-slate-400'>
      <Navbar />
      <Component {...pageProps} />
    </div>
  )
}
