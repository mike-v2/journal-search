'use client';

import Head from 'next/head'

import CarouselJournalEntries from '@/components/carouselJournalEntries';
import ChatSample from '@/components/chatSample';
import CarouselImages from '@/components/carouselImages';
import Intro from '@/app/intro';

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
        <Intro />

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
