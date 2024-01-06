'use client';

import Head from 'next/head'

import CarouselJournalEntries from '@/components/carouselJournalEntries';
import ChatSample from '@/components/chatSample';
import CarouselImages from '@/components/carouselImages';
import Intro from '@/app/intro';

export default function Home() {
  return (
    <>
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
