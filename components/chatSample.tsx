'use client';

import { useState } from 'react';

const harryPrompt = "Did I ever tell you about the time I took a road trip with my son Charles?"

export default function ChatSample() {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("harry chat submitted");
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="max-w-md p-4 mr-auto rounded-xl border-2 border-amber-300">
        <h5 className='text-amber-200'>Harry:</h5>
        <p className="text-lg">{harryPrompt}</p>
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