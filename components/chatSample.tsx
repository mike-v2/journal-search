'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const harryPrompt = "Did I ever tell you about the time I took a road trip with my son Charles?"

export default function ChatSample() {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("harry chat submitted");

    const messages: ChatMessage[] = [];
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: harryPrompt
    }
    const userMsg: ChatMessage = {
      role: 'user',
      content: input
    }
    messages.push(assistantMsg);
    messages.push(userMsg);

    router.push(`/chat?start=${encodeURIComponent(JSON.stringify(messages))}`);
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="max-w-md p-8 mr-auto rounded-xl border-2 border-amber-300">
        <div className="flex gap-x-6">
          <div className='w-80'>
            <Image
              className='w-full h-auto rounded-full'
              src='/images/Harry-small.jpg'
              width={0}
              height={0}
              sizes="100vw"
              alt='Harry Howard'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <h5 className='text-amber-200'>Harry:</h5>
            <p className="text-lg">{harryPrompt}</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="w-full max-w-md ml-auto px-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-xl h-12 p-3 border-gray-300 border-2"
            placeholder="Chat with Harry..."
            aria-label="Chat input"
          />
        </div>
      </form>
    </div>
  )
}