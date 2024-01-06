'use client';

import dynamic from 'next/dynamic';

import Intro from '@/app/intro';

const DynamicCarouselImages = dynamic(() => import('@/components/carouselImages'), {
  loading: () => <p>Loading...</p>
});

const DynamicChatSample = dynamic(() => import('@/components/chatSample'), {
  loading: () => <p>Loading...</p>
});

const DynamicCarouselJournalEntries = dynamic(() => import('@/components/carouselJournalEntries'), {
  loading: () => <p>Loading...</p>
});

export default function Home() {
  return (
    <main role="main">
      <Intro />

      <section className='mt-64 '>
        <DynamicCarouselImages />
      </section>
      <section className='mt-64'>
        <DynamicChatSample />
      </section>
      <section className='mt-64 pb-32'>
        <DynamicCarouselJournalEntries />
      </section>
    </main>
  )
}
