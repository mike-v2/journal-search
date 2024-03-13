import dynamic from 'next/dynamic';
import Image from 'next/image';

import { withAxiosTryCatch } from '@/utils/withAxiosTryCatch';

import Intro from '@/app/components/intro';
import { getJournalEntries } from '@/app/apiRequests/serverApiRequests';

const DynamicCarouselImages = dynamic(
  () => import('@/components/carouselImages'),
  {
    loading: () => <p>Loading...</p>,
  },
);

const DynamicChatSample = dynamic(() => import('@/app/components/chatSample'), {
  loading: () => <p>Loading...</p>,
});

const DynamicCarouselJournalEntries = dynamic(
  () => import('@/components/carouselJournalEntries'),
  {
    loading: () => <p>Loading...</p>,
  },
);

const carouselEntries = [
  '06-24-1948',
  '12-27-1944',
  '12-28-1945',
  '12-06-1944',
  '08-24-1945',
  '11-07-1945',
  '6-10-1944',
  '09-19-1948',
  '04-16-1948',
];

export default async function Home() {
  const { data: journalEntries } = await withAxiosTryCatch(
    getJournalEntries(carouselEntries),
  );

  return (
    <main>
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
        {journalEntries && (
          <DynamicCarouselJournalEntries journalEntries={journalEntries} />
        )}
      </section>
    </main>
  );
}
