'use client';

import Head from 'next/head'
import Image from 'next/image'
import { Playball } from 'next/font/google'
import Carousel from '@/components/carousel';
import ChatSample from '@/components/chatSample';

const playball = Playball({
  subsets: ['latin'],
  weight: ['400'],
})

/* const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400'],
})

const arvo = Arvo({
  subsets: ['latin'],
  weight: ['400'],
}) */

const bioText = {
  header: "Welcome to the Harry Howard Journals:",
  subheader: "A Glimpse into the 1930s Life of a Salt Lake City Family Man",
  body: "Discover the fascinating world of Harry Howard (1899-1959), a devoted husband, father, and proud resident of Salt Lake City. Through the pages of his personal journals, we invite you to journey back in time and gain insight into the life and experiences of a family man in the 1930s.\n\nHarry worked tirelessly at the post office, ensuring the smooth flow of communication within his community. He was married to the love of his life, Grace, with whom he built a beautiful family. Together, they raised seven children: Cathy, Charles, Sonny, Sharon, Ardie, Dorothy and Betty.\n\nHarry was a deeply spiritual man, actively involved in the Latter-Day Saints (LDS) church. His faith and commitment to his community played a significant role in shaping his daily life.\n\nAs you explore this site, take a moment to immerse yourself in Harry's world. Delve into his thoughts, hopes, and dreams, and witness the unfolding of a rich and vibrant family history that has been lovingly preserved for future generations.\n\nWelcome to the Harry Howard Journals – your portal to the past."
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Harry&apos;s Journals</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
      </Head>
      <main role="main">
        <section className='flex flex-col md:flex-row max-w-7xl mx-auto h-fit'>
          <div className='mx-auto basis-full flex justify-center'>
            <Image src='/images/Harry-1.png' className='object-contain w-auto' width={600} height={800} alt='picture of Harry Howard' role="img" aria-label="Image of Harry Howard" />
          </div>
          <article className='flex flex-col pt-16 px-2  whitespace-pre-line basis-full'>
            <h3 className={`${playball.className} text-4xl text-slate-200 pb-2`}>
              {bioText.header}
            </h3>
            <h5 className={`text-xl text-slate-200 pb-4`}>
              {bioText.subheader}
            </h5>
            <p>
              {bioText.body}
            </p>
          </article>
        </section>
        <section className='mt-32'>
          <Carousel />
        </section>
        <section className='mt-32 pb-32'>
          <ChatSample />
        </section>
      </main>
    </>
  )
}