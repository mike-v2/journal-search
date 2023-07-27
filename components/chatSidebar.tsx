import { Conversation } from '@prisma/client';
import Image from 'next/image';
import React, { useState } from 'react';

export default function ChatSidebar({ conversations, conversationClicked }: { conversations: Conversation[], conversationClicked: (convId: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-full">
      <div className={`transition-transform top-200 left-0 w-64 bg-amber-100 fixed h-full 
                ${isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'}`}>
        <div className="px-2">
          <button onClick={() => setIsOpen(false)} className="flex justify-end w-full px-4 mt-4">
            <Image src='/images/sidebar-icon.svg' width={50} height={50} alt='sidebar icon' />
          </button>
          <div className="mt-6">
            <h1 className="mb-6 text-lg font-bold text-gray-700 text-center">Conversations</h1>
            <div className="flex flex-col gap-y-4">
              {conversations.map((conversation, index) => (
                <div key={index} className="border border-black rounded-full cursor-pointer p-4" onClick={e => conversationClicked(conversation.id)}>
                  <p className="font-medium text-gray-700 truncate">{conversation.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={`fixed top-200 left-0 w-64 ${isOpen ? 'hidden' : ''}`}>
        <button onClick={() => setIsOpen(true)} className="mt-3 ml-3">
          <Image src='/images/sidebar-icon.svg' className='invert' width={50} height={50} alt='sidebar icon' />
        </button>
      </div>
    </div>
  );
};
