'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import ChatSidebar from '@/components/chatSidebar';
import ChatSuggestions from '@/components/chatSuggestions';
import useChatApi from '@/hooks/useChat';

export default function Chat() {
  const { data: session } = useSession();
  const [userTextInput, setUserTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    loadConversationHistory,
    submitChatMessage,
    clearActiveConversation,
    startConversationWithInitialMessages,
    handleDeleteConversation,
    conversations,
    partialResponse,
    messageHistory,
    isLoadingResponse,
    isErrorLoadingResponse,
  } = useChatApi(session);

  const handleSubmitText = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await submitChatMessage(userTextInput);
    setUserTextInput('');
    scrollToBottom();
  };

  function scrollToBottom() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  useEffect(() => {
    const start = searchParams?.get('start');
    if (start && searchParams) {
      const startMessages = JSON.parse(decodeURIComponent(start as string));

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('start');
      if (pathname) {
        router.replace(`${pathname}?${newSearchParams}`);
      }

      startConversationWithInitialMessages(startMessages);
    }
  }, [searchParams, pathname, router, startConversationWithInitialMessages]);

  function handleConversationClicked(convId: string) {
    loadConversationHistory(convId);
  }

  function handleSelectChatSuggestion(prompt: string) {
    const message: ChatMessage = {
      role: 'user',
      content: prompt,
    };

    startConversationWithInitialMessages([message]);
  }

  return (
    <main className='mt-8 min-h-screen' aria-label='Chat with Harry'>
      <ChatSidebar
        conversations={conversations}
        conversationClicked={handleConversationClicked}
        handleDeleteConversation={handleDeleteConversation}
        handleClearConversation={clearActiveConversation}
      />
      <section
        className='mx-auto flex max-w-5xl flex-col px-2 pb-28 pt-10'
        aria-label='Chat history'
      >
        {messageHistory &&
          messageHistory.slice().map((msg, i) => {
            const speaker =
              msg.role === 'user'
                ? 'You:'
                : msg.role === 'assistant'
                  ? 'Harry Howard:'
                  : '';

            let border = 'border-slate-200';
            let textColor = '';

            if (msg.role === 'assistant') {
              border = 'border-amber-300';
              textColor = 'text-amber-200';
            }

            return (
              <div
                className={`${border} mb-8 flex flex-col gap-y-2 rounded-xl border p-4 sm:flex-row`}
                key={i}
              >
                <h4
                  className={`${textColor} basis-1/6 pr-4 text-lg font-bold leading-5 sm:text-right`}
                >
                  {speaker}
                </h4>
                <p className='basis-5/6 ps-3'>{msg.content}</p>
              </div>
            );
          })}
        {partialResponse && partialResponse !== '' && (
          <div className='mb-8 flex flex-col gap-y-2 rounded-xl border border-amber-300 p-4 sm:flex-row'>
            <h4 className='basis-1/6 pr-4 text-lg font-bold leading-5 text-amber-200 sm:text-right'>
              Harry Howard:
            </h4>
            <p className='basis-5/6 ps-3'>{partialResponse}</p>
          </div>
        )}
        {isLoadingResponse && !partialResponse && (
          <p className='text-center text-lg italic'>Harry is thinking...</p>
        )}
        {isErrorLoadingResponse && (
          <p
            className='mx-auto max-w-7xl border border-red-600 p-4'
            role='alert'
          >
            Error loading response. Please try again.
          </p>
        )}
      </section>
      <div ref={messagesEndRef}></div>
      {!isLoadingResponse &&
        !partialResponse &&
        (!messageHistory || messageHistory.length === 0) && (
          <section>
            <ChatSuggestions
              handleSelectSuggestion={handleSelectChatSuggestion}
            />
          </section>
        )}
      <form onSubmit={handleSubmitText}>
        <div className='fixed inset-x-0 bottom-8 mx-auto w-full max-w-md px-2'>
          <input
            type='text'
            value={userTextInput}
            onChange={(e) => setUserTextInput(e.target.value)}
            className='h-12 w-full rounded-xl border-2 border-gray-300 p-3'
            placeholder='Chat with Harry...'
            aria-label='Chat input'
          />
        </div>
      </form>
    </main>
  );
}
