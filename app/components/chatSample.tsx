'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/input';
import { useQueryString } from '@/hooks/useQueryString';

const harryPrompt =
  'Did I ever tell you about the time I took a road trip with my son Charles?';

export default function ChatSample() {
  const [input, setInput] = useState('');
  const router = useRouter();
  const { createQueryString } = useQueryString();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const messages: ChatMessage[] = [];
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: harryPrompt,
    };
    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
    };
    messages.push(assistantMsg);
    messages.push(userMsg);

    const queryString = createQueryString(
      'start',
      encodeURIComponent(JSON.stringify(messages)),
    );
    router.push(`/chat?${queryString}`);
  };

  return (
    <div className='mx-auto max-w-5xl p-4'>
      <div className='mr-auto max-w-md rounded-xl border-2 border-amber-300 p-8'>
        <div className='flex gap-x-6'>
          <div className='w-80'>
            <Image
              className='h-auto w-full rounded-full'
              src='/images/Harry-small.jpg'
              width={0}
              height={0}
              sizes='100vw'
              alt='Harry Howard'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <h5 className='text-amber-200'>Harry:</h5>
            <p className='text-lg'>{harryPrompt}</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className='mt-4'>
        <div className='ml-auto w-full max-w-md px-2'>
          <Input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Chat with Harry...'
            aria-label='Chat input'
          />
        </div>
      </form>
    </div>
  );
}
