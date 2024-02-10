'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import Intro from '@/app/components/intro';

const DynamicCarouselImages = dynamic(
  () => import('@/components/carouselImages'),
  {
    loading: () => <p>Loading...</p>,
  },
);

const DynamicChatSample = dynamic(
  () => import('@/app/chat/components/chatSample'),
  {
    loading: () => <p>Loading...</p>,
  },
);

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
            className='h-auto w-full'
            alt='Photographs title'
          />
          <Image
            src='/images/camera-1.png'
            width={251}
            height={206}
            className='absolute -left-full top-3/4 z-0 h-auto w-[30rem] opacity-35'
            alt='old camera'
          />
          <Image
            src='/images/camera-2.png'
            width={200}
            height={262}
            className='absolute -right-2/3 top-[25rem] z-0 h-auto w-72 opacity-35'
            alt='old camera'
          />
        </h2>
        <DynamicCarouselImages />
      </section>
      <section className='mt-64'>
        <h2 className='mx-auto my-12 w-full max-w-lg'>
          <Image
            src='/images/banner-chat.png'
            width={352}
            height={896}
            className='h-auto w-full'
            alt='Chat title'
          />
        </h2>
        <DynamicChatSample />
      </section>
      <section className='mt-64 pb-32'>
        <h2 className='mx-auto my-12 w-full max-w-lg'>
          <Image
            src='/images/banner-sample-entries.png'
            width={352}
            height={896}
            className='h-auto w-full'
            alt='Sample entries title'
          />
        </h2>
        <DynamicCarouselJournalEntries />
      </section>
    </main>
  );
}
