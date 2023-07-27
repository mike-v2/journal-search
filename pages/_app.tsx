import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '../components/navbar'
import {SessionProvider} from 'next-auth/react'
import '@etchteam/next-pagination/dist/index.css'
import { Josefin_Sans } from 'next/font/google'
import Modal from 'react-modal';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
});

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#__next');

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <div className={`${josefin.className} bg-slate-800 text-slate-400`}>
        <Navbar />
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  )
}
