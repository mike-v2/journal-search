'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import Modal from 'react-modal';
import { Conversation } from '@prisma/client';

const logoHeight = 100;

export default function ChatSidebar({
  conversations,
  conversationClicked,
  handleDeleteConversation,
  handleClearConversation,
}: {
  conversations: Conversation[];
  conversationClicked: (convId: string) => void;
  handleDeleteConversation: (convId: string) => void;
  handleClearConversation: () => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [preparedToDeleteConvoId, setPreparedToDeleteConvoId] =
    useState<string>('');
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarRef.current) return;

    sidebarRef.current.style.top = `${logoHeight}px`;
    sidebarRef.current.style.height = `calc(100vh - ${logoHeight}px)`;

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', function () {
        if (!sidebarRef.current) return;

        if (window.scrollY > logoHeight) {
          sidebarRef.current.style.top = '0';
          sidebarRef.current.style.height = '100vh';
        } else {
          sidebarRef.current.style.top = `${logoHeight - window.scrollY}px`;
          sidebarRef.current.style.height = `calc(100vh - ${
            logoHeight - window.scrollY
          }px)`;
        }
      });
    }
  }, [sidebarRef]);

  function handlePrepareToDeleteConversation(convoId: string) {
    setIsModalOpen(true);
    setPreparedToDeleteConvoId(convoId);
  }

  function checkHandleDeleteConversation() {
    if (preparedToDeleteConvoId !== '') {
      handleDeleteConversation(preparedToDeleteConvoId);
      closeModal();
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setPreparedToDeleteConvoId('');
  }

  return (
    <div className='flex h-full'>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={(e) => closeModal()}
        className='m-auto max-w-md rounded-md border bg-slate-800 p-5'
        overlayClassName='fixed inset-0 bg-black bg-opacity-50 flex'
        contentLabel='Create Post Modal'
        ariaHideApp={false}
      >
        <div className='flex flex-col gap-y-8 p-4'>
          <p>Delete this conversation?</p>
          <button
            className={`btn ml-auto block ${
              preparedToDeleteConvoId === '' ? 'text-gray-500' : 'text-white'
            }`}
            onClick={checkHandleDeleteConversation}
          >
            Delete
          </button>
        </div>
      </Modal>
      <div
        ref={sidebarRef}
        className={`fixed bottom-0 left-0 w-80 rounded-r-3xl bg-amber-100 px-2 transition-transform ${
          isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
        }`}
      >
        <div className='border-0 border-b-2 border-b-black'>
          <button
            onClick={() => setIsOpen(false)}
            className='mt-4 flex w-full justify-end px-4'
          >
            <Image
              src='/images/sidebar-icon.svg'
              width={50}
              height={50}
              alt='sidebar icon'
            />
          </button>
          <h1 className='mb-6 text-center text-lg font-bold text-gray-700'>
            Conversations
          </h1>
        </div>
        <div className='mt-6 h-full overflow-auto'>
          <div className='flex flex-col gap-y-4'>
            {conversations.map((conversation, index) => (
              <div
                key={index}
                className='tooltip relative cursor-pointer rounded-full border border-black p-4'
                onClick={(e) => conversationClicked(conversation.id)}
                data-tip={conversation.title}
              >
                <p className='truncate font-medium text-gray-700'>
                  {conversation.title}
                </p>
                <button
                  className='btn-hidden absolute right-0 top-1/2 mr-4 -translate-y-1/2 rounded-md bg-black p-2 transition-none'
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrepareToDeleteConversation(conversation.id);
                  }}
                >
                  <Image
                    src='/images/delete-icon.svg'
                    className='invert'
                    width={30}
                    height={30}
                    alt='delete icon'
                  />
                </button>
              </div>
            ))}
            <div
              className='relative cursor-pointer rounded-full border border-black p-4'
              onClick={(e) => handleClearConversation()}
            >
              <p className='truncate font-medium text-gray-700'>
                New Conversation
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className={`absolute left-0 top-52 w-fit ${isOpen ? 'hidden' : ''}`}>
        <button onClick={() => setIsOpen(true)} className='ml-3 mt-3'>
          <Image
            src='/images/sidebar-icon.svg'
            className='invert'
            width={50}
            height={50}
            alt='sidebar icon'
          />
        </button>
      </div>
    </div>
  );
}
