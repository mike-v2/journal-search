import { Conversation } from '@prisma/client';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';

export default function ChatSidebar({ conversations, conversationClicked, handleDeleteConversation }: { conversations: Conversation[], conversationClicked: (convId: string) => void, handleDeleteConversation: (convId: string) => void }) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [preparedToDeleteConvoId, setPreparedToDeleteConvoId] = useState<string>('');
  const sidebarRef = useRef<HTMLDivElement>(null);

  const logoHeight = 270;

  useEffect(() => {
    if (!sidebarRef.current) return;

    sidebarRef.current.style.top = `${logoHeight}px`;
    sidebarRef.current.style.height = `calc(100vh - ${logoHeight}px)`;

    if (typeof window !== "undefined") {
      window.addEventListener('scroll', function () {
        if (!sidebarRef.current) return;

        if (window.scrollY > logoHeight) {
          sidebarRef.current.style.top = '0';
          sidebarRef.current.style.height = '100vh';
        } else {
          sidebarRef.current.style.top = `${logoHeight - window.scrollY}px`;
          sidebarRef.current.style.height = `calc(100vh - ${logoHeight - window.scrollY}px)`;
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
    <div className="flex h-full">
      <Modal
        isOpen={isModalOpen}
        onRequestClose={e => closeModal()}
        className="m-auto p-5 border rounded-md max-w-md bg-slate-800"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex"
        contentLabel="Create Post Modal"
      >
        <div className='flex flex-col gap-y-8 p-4'>
          <p>Delete this conversation?</p>
          <button className={`btn block ml-auto ${preparedToDeleteConvoId === '' ? 'text-gray-500' : 'text-white'}`} onClick={checkHandleDeleteConversation}>Delete</button>
        </div>
      </Modal>
      <div ref={sidebarRef} className={`transition-transform fixed left-0 bottom-0 w-80 bg-amber-100 rounded-r-3xl overflow-auto ${isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'}`}>
        <div className="px-2">
          <button onClick={() => setIsOpen(false)} className="flex justify-end w-full px-4 mt-4">
            <Image src='/images/sidebar-icon.svg' width={50} height={50} alt='sidebar icon' />
          </button>
          <div className="mt-6">
            <h1 className="mb-6 text-lg font-bold text-gray-700 text-center">Conversations</h1>
            <div className="flex flex-col gap-y-4">
              {conversations.map((conversation, index) => (
                <div key={index} className="tooltip relative border border-black rounded-full cursor-pointer p-4" onClick={e => conversationClicked(conversation.id)} data-tip={conversation.title}>
                  <p className="font-medium text-gray-700 truncate">{conversation.title}</p>
                  <button className="btn-hidden absolute right-0 top-1/2 transition-none -translate-y-1/2 bg-black rounded-md p-2 mr-4" onClick={e => { e.stopPropagation(); handlePrepareToDeleteConversation(conversation.id); }}>
                    <Image src='/images/delete-icon.svg' className='invert' width={30} height={30} alt='delete icon' />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={`absolute top-52 left-0 w-fit ${isOpen ? 'hidden' : ''}`}>
        <button onClick={() => setIsOpen(true)} className="mt-3 ml-3">
          <Image src='/images/sidebar-icon.svg' className='invert' width={50} height={50} alt='sidebar icon' />
        </button>
      </div>
    </div>
  );
};
