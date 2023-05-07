import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '../components/navbar'
import {SessionProvider} from 'next-auth/react'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <div className='bg-slate-800 text-slate-400'>
        <Navbar />
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  )
}
