import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Josefin_Sans, Playball, Libre_Baskerville, Arvo} from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import CreateData from '@/components/createData'

const inter = Inter({ subsets: ['latin'] })

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500'],
});

const playball = Playball({
  subsets: ['latin'],
  weight: ['400'],
})

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400'],
})

const arvo = Arvo({
  subsets: ['latin'],
  weight: ['400'],
})

const bioText = {
  header: "Welcome to the Harry Howard Journals:",
  subheader: "A Glimpse into the 1930s Life of a Salt Lake City Family Man",
  body: "Discover the fascinating world of Harry Howard (1899-1959), a devoted husband, father, and proud resident of Salt Lake City. Through the pages of his personal journals, we invite you to journey back in time and gain insight into the life and experiences of a family man in the 1930s.\n\nHarry worked tirelessly at the post office, ensuring the smooth flow of communication within his community.He was married to the love of his life, Grace, with whom he built a beautiful family.Together, they raised seven children: Cathy, Charles, Sonny, Sharon, Ardie, Dorothy and Betty.\n\nHarry was a deeply spiritual man, actively involved in the Latter- Day Saints (LDS) church.His faith and commitment to his community played a significant role in shaping his daily life.\n\nAs you explore this site, take a moment to immerse yourself in Harry's world. Delve into his thoughts, hopes, and dreams, and witness the unfolding of a rich and vibrant family history that has been lovingly preserved for future generations.\n\nWelcome to the Harry Howard Journals – your portal to the past."
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Journal Search</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className='flex flex-col md:flex-row mt-10 max-w-5xl mx-auto h-fit'>
          <div className='mx-auto w-full md:w-1/2 flex justify-center'>
            <Image src='/images/page-0097.png' className='object-cover' width={600} height={800} alt='picture of Harry Howard' />
          </div>
          <div className='text-center whitespace-pre-line w-full md:w-1/2'>
            <h3 className={`${playball.className} p-5 text-4xl text-slate-200`}>
              {bioText.header}
            </h3>
            <h3 className={`${josefin.className} p-5 pt-0 text-xl text-slate-200`}>
              {bioText.subheader}
            </h3>
            <div className={`${josefin.className} p-5 `}>
              {bioText.body}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
