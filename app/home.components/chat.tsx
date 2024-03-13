import dynamic from 'next/dynamic';
import Image from 'next/image';

const DynamicChatSample = dynamic(() => import('@/app/components/chatSample'), {
  loading: () => <p>Loading...</p>,
});

export function Chat() {
  return (
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
  );
}
