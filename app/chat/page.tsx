'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Conversation, Message } from '@prisma/client';

import ChatSidebar from '@/components/chatSidebar';

type ConversationExt = Conversation & {
  messages: Message[];
};

export default function Chat() {
  const { data: session } = useSession();
  const [userTextInput, setUserTextInput] = useState('');
  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);
  const [isErrorLoadingResponse, setIsErrorLoadingResponse] =
    useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ConversationExt>();
  const [partialResponse, setPartialResponse] = useState<string>('');
  const partialResponseRef = useRef(partialResponse);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    //console.log("partial response has changed. setting response ref: " + partialResponse);
    partialResponseRef.current = partialResponse;
  }, [partialResponse]);

  useEffect(() => {
    const loadConversationHistory = async () => {
      try {
        const res = await fetch(`api/conversation?userId=${session?.user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const convs = (await res.json()) as Conversation[];
        if (convs) {
          setConversations(convs);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (session?.user) {
      loadConversationHistory();
    }
  }, [session]);

  const createNewConversation =
    useCallback(async (): Promise<ConversationExt | null> => {
      try {
        const response = await fetch('/api/conversation', {
          method: 'POST',
          body: JSON.stringify({
            userId: session?.user.id,
          }),
        });

        const conv = await response.json();
        return conv;
      } catch (error) {
        console.error(error);
      }
      return null;
    }, [session?.user]);

  const saveMessage = async (
    { role, content }: { role: string; content: string },
    conv: Conversation,
  ) => {
    console.log('trying to save message: ' + content.slice(0, 200));
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: conv.id,
          role,
          content,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitText = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('text submitted: ' + userTextInput);

    // would be better to add user's message when response from OpenAI is successfully received so we're not adding extra messages to chat history, but then user's message won't get displayed after submitting
    const userMessage = { role: 'user', content: userTextInput };
    const updatedHistory = [...messageHistory, userMessage];
    setMessageHistory(updatedHistory);

    let newConvo: Conversation | null = null;
    if (session?.user) {
      if (!activeConversation) {
        newConvo = await createNewConversation();
        console.log('created new conversation::');
        console.log(newConvo);
        if (newConvo) {
          setConversations((prevConvos) => [
            ...prevConvos,
            newConvo as Conversation,
          ]);
          setActiveConversation(newConvo as ConversationExt);
          saveMessage(userMessage, newConvo);
        }
      } else {
        saveMessage(userMessage, activeConversation);
      }
    }

    const convo = activeConversation ?? newConvo;
    startStreamingResponse(updatedHistory, convo ?? undefined);

    setUserTextInput('');
  };

  const onResponseFinished = useCallback((convo?: Conversation) => {
    const aiMsg = { role: 'assistant', content: partialResponseRef.current };
    setMessageHistory((prevHistory) => [...prevHistory, aiMsg]);
    if (convo) {
      console.log('trying to save message with convo::');
      console.log(convo);
      saveMessage(aiMsg, convo);
    }

    setPartialResponse('');
  }, []);

  const editConversationTitle = useCallback(
    async (convoId: string, text: string) => {
      const getChatTitleFromAI = async (chatText: string): Promise<string> => {
        try {
          const response = await fetch('/api/chatTitle', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: chatText }),
          });

          const data = await response.json();
          return data.title;
        } catch (error) {
          console.error(error);
        }
        return '';
      };

      console.log('retrieving title');
      const title = await getChatTitleFromAI(text);
      console.log('AI has created new title: ' + title);
      setConversations((prevConvos) =>
        prevConvos.map((convo) => {
          if (convo.id === convoId) {
            convo.title = title;
            return convo;
          } else return convo;
        }),
      );
      if (activeConversation?.id === convoId) {
        const newActiveConvo = activeConversation;
        newActiveConvo.title = title;
        setActiveConversation(newActiveConvo);
      }

      try {
        const response = await fetch(`/api/conversation`, {
          method: 'PATCH',
          body: JSON.stringify({ id: convoId, title: title }),
        });
      } catch (error) {
        console.error(error);
      }
    },
    [activeConversation],
  );

  const startStreamingResponse = useCallback(
    (chatHistory: ChatMessage[], convo?: Conversation) => {
      setIsLoadingResponse(true);

      async function fetchChatResponse() {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatHistory }),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('no reader');
          }

          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              console.log(
                'Connection was closed with partialReponse = ' +
                  partialResponseRef.current.substring(0, 20),
              );
              if (convo && !convo.title) {
                // first AI response just finished
                editConversationTitle(
                  convo.id,
                  'user: ' +
                    chatHistory[0].content +
                    ' assistant: ' +
                    partialResponseRef.current,
                );
              }
              onResponseFinished(convo);
              setIsLoadingResponse(false);
              break;
            }

            const text = new TextDecoder().decode(value);
            //console.log('received chunk: ', text);
            setPartialResponse((prevRes) => prevRes + text);
          }
        } catch (error) {
          console.error(error);
        }
      }

      fetchChatResponse();
    },
    [editConversationTitle, onResponseFinished],
  );

  useEffect(() => {
    const initMessages = async (startMessages: ChatMessage[]) => {
      setMessageHistory(startMessages);

      let newConvo: Conversation | null = null;
      if (session?.user) {
        newConvo = await createNewConversation();
        console.log('created new conversation::');
        console.log(newConvo);
        if (newConvo) {
          setConversations((prevConvos) => [
            ...prevConvos,
            newConvo as Conversation,
          ]);
          setActiveConversation(newConvo as ConversationExt);

          const assistantMsg = startMessages[0];
          const userMsg = startMessages[1];
          await saveMessage(assistantMsg, newConvo);
          saveMessage(userMsg, newConvo);
        }
      }

      const convo = activeConversation ?? newConvo;
      startStreamingResponse(startMessages, convo ?? undefined);
    };

    const start = searchParams?.get('start');
    if (start && searchParams) {
      const startMessages = JSON.parse(decodeURIComponent(start as string));
      console.log('Starting conversation with:', startMessages);

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('start');

      if (pathname) {
        router.replace(`${pathname}?${newSearchParams}`);
      }

      console.log('setting start messages:', startMessages);
      initMessages(startMessages);
    }
  }, [
    session?.user,
    activeConversation,
    createNewConversation,
    startStreamingResponse,
    searchParams,
    pathname,
    router,
  ]);

  function handleConversationClicked(convId: string) {
    const fetchConversationMessages = async () => {
      try {
        const response = await fetch(`api/conversation?id=${convId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const conv = (await response.json()) as ConversationExt;
        if (conv) {
          conv.messages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          const msgHist: ChatMessage[] = [];
          conv.messages.map((message) => {
            msgHist.push({ role: message.role, content: message.content });
          });
          setMessageHistory(msgHist);
          setActiveConversation(conv);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchConversationMessages();
  }

  function handleDeleteConversation(convoId: string) {
    const deleteAllMessagesInConversation = async () => {
      try {
        const response = await fetch(`api/message?conversationId=${convoId}`, {
          method: 'DELETE',
        });

        if (response.status === 200) {
          console.log('Deleted messages for conversation: ' + convoId);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const deleteConversation = async () => {
      try {
        const response = await fetch(`api/conversation?id=${convoId}`, {
          method: 'DELETE',
        });

        if (response.status === 200) {
          console.log('Deleted conversation: ' + convoId);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const deleteInOrder = async () => {
      await deleteAllMessagesInConversation();
      deleteConversation();
      if (activeConversation && activeConversation.id === convoId) {
        clearActiveConversation();
      }
      setConversations((prevConvos) =>
        prevConvos.filter((convo) => convo.id !== convoId),
      );
    };

    deleteInOrder();
  }

  function clearActiveConversation() {
    setMessageHistory([]);
    setActiveConversation(undefined);
  }

  return (
    <main className='mt-8 min-h-screen' aria-label='Chat with Harry'>
      <ChatSidebar
        conversations={conversations}
        conversationClicked={handleConversationClicked}
        handleDeleteConversation={handleDeleteConversation}
        handleClearConversation={clearActiveConversation}
      />
      <form onSubmit={handleSubmitText}>
        <div className='mx-auto w-full max-w-md px-2'>
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
      {isLoadingResponse && (
        <p className='text-center text-lg italic'>Harry is thinking...</p>
      )}
      {isErrorLoadingResponse && (
        <p className='mx-auto max-w-7xl border border-red-600 p-4' role='alert'>
          Error loading response. Please try again.
        </p>
      )}
      <section
        className='mx-auto flex max-w-5xl flex-col px-2 pt-10'
        aria-label='Chat history'
      >
        {partialResponse && partialResponse !== '' && (
          <div className='mb-8 flex flex-col gap-y-2 rounded-xl border border-amber-300 p-4 sm:flex-row'>
            <h4 className='basis-1/6 pr-4 text-lg font-bold leading-5 text-amber-200 sm:text-right'>
              Harry Howard:
            </h4>
            <p className='basis-5/6 ps-3'>{partialResponse}</p>
          </div>
        )}
        {messageHistory &&
          messageHistory
            .slice()
            .reverse()
            .map((msg, i) => {
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
      </section>
    </main>
  );
}
