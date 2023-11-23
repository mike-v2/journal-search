'use client';

import Head from 'next/head'
import Image from 'next/image'
import { Playball } from 'next/font/google'
import CarouselJournalEntries from '@/components/carouselJournalEntries';
import ChatSample from '@/components/chatSample';
import CarouselImages from '@/components/carouselImages';

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
        <section className='relative flex flex-col md:flex-row h-fit border-b-4 border-b-amber-200'>
          <div className="banner absolute inset-0 opacity-20"></div>
          <div className='relative z-0 w-full max-w-3xl mx-auto'>
            <Image className='w-full h-auto'
              src='/images/harry-banner.png'
              width={0}
              height={0}
              sizes="100vw"
              alt='Welcome banner'
            />
            <div className="absolute -bottom-20 left-0 lg:-left-40 w-80 h-80">
              <Image className='w-full h-auto'
                src='/images/books-1.png'
                width={0}
                height={0}
                sizes="100vw"
                alt='stack of books'
              />
            </div>
            <div className="absolute -bottom-20 right-0 lg:-right-40 w-80 h-80">
              <Image className='w-full h-auto'
                src='/images/books-2.png'
                width={0}
                height={0}
                sizes="100vw"
                alt='stack of books'
              />
            </div>
          </div>
        </section>

        <section>
          <article className='whitespace-pre-line basis-full max-w-3xl relative z-0 p-20 mx-auto'>
            <p>
              {bioText.body}
            </p>

            <div className='w-[40rem] h-[40rem] absolute bottom-0 right-0 -z-10'>
              <Image
                src='/images/quill.png'
                className='w-full h-auto opacity-30'
                width={0}
                height={0}
                sizes="100vw"
                alt='quill' />
            </div>
          </article>
        </section>

        <section className='mt-64 '>
          <CarouselImages />
        </section>
        <section className='mt-64'>
          <ChatSample />
        </section>
        <section className='mt-64 pb-32'>
          <CarouselJournalEntries />
        </section>
      </main>
    </>
  )
}
