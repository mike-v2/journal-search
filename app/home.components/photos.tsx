import dynamic from 'next/dynamic';
import Image from 'next/image';

const DynamicCarouselImages = dynamic(
  () => import('@/app/home.components/carouselImages'),
  {
    loading: () => <p>Loading...</p>,
  },
);

export function Photos() {
  return (
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
  );
}
