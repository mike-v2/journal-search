'use client';

import dynamic from 'next/dynamic';

import Intro from '@/components/intro';
import Image from 'next/image';

const DynamicCarouselImages = dynamic(
  () => import('@/components/carouselImages'),
  {
    loading: () => <p>Loading...</p>,
  },
);

const DynamicChatSample = dynamic(() => import('@/components/chatSample'), {
  loading: () => <p>Loading...</p>,
});

const DynamicCarouselJournalEntries = dynamic(
  () => import('@/components/carouselJournalEntries'),
  {
    loading: () => <p>Loading...</p>,
  },
);

export default function Home() {
  return (
    <main role='main'>
      <Intro />

      <section className='mt-64 '>
        <h2 className='relative mx-auto my-12 w-full max-w-lg'>
          <Image
            src='/images/banner-photos.png'
            width={352}
            height={896}
            className='relative z-10 h-auto w-full'
            alt='Photographs title'
          />
          <Image
            src='/images/camera-1.png'
            width={251}
            height={206}
            className='absolute -left-1/2 top-5 z-0 h-auto w-64 opacity-35'
            alt='old camera'
          />
          <Image
            src='/images/camera-2.png'
            width={200}
            height={262}
            className='absolute -right-1/4 top-1/3 z-0 h-auto w-48 opacity-35'
            alt='old camera'
          />
        </h2>
        <DynamicCarouselImages />
      </section>
      <section className='mt-64'>
        <DynamicChatSample />
      </section>
      <section className='mt-64 pb-32'>
        <DynamicCarouselJournalEntries />
      </section>
    </main>
  );
}
