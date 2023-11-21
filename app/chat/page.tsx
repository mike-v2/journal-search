'use client'

import ChatSidebar from "@/components/chatSidebar";
import { Conversation, Message } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react"

type ConversationExt = Conversation & {
  messages: Message[],
}

export default function Chat() {
  const { data: session } = useSession();
  const [userTextInput, setUserTextInput] = useState('');
  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);
  const [isErrorLoadingResponse, setIsErrorLoadingResponse] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationExt>();
  const [partialResponse, setPartialResponse] = useState<string>('');
  const partialResponseRef = useRef(partialResponse);

  const searchParams = useSearchParams();
  const start = searchParams?.get('start');

  useEffect(() => {
    const initMessages = async () => {
      const startMessages = JSON.parse(decodeURIComponent(start as string));
      console.log('Starting conversation with:', startMessages);

      setMessageHistory(startMessages);

      let newConvo: Conversation | null = null;
      if (session?.user) {
        newConvo = await createNewConversation();
        console.log("created new conversation::");
        console.log(newConvo);
        if (newConvo) {
          setConversations(prevConvos => [...prevConvos, newConvo as Conversation]);
          setActiveConversation(newConvo as ConversationExt);

          const assistantMsg = startMessages[0];
          const userMsg = startMessages[1];
          await saveMessage(assistantMsg, newConvo);
          saveMessage(userMsg, newConvo);
        }
      }

      const convo = activeConversation ?? newConvo;
      startStreamingResponse(startMessages, convo ?? undefined);
    }

    if (start) {
      initMessages();
    }
  }, [start]);

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

        const convs = await res.json() as Conversation[];
        if (convs) {
          setConversations(convs);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (session?.user) {
      loadConversationHistory();
    }
  }, [session]);

  const createNewConversation = async (): Promise<ConversationExt | null> => {
    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        body: JSON.stringify({
          userId: session?.user.id,
        })
      })

      const conv = await response.json();
      return conv;
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  const saveMessage = async ({ role, content }: { role: string, content: string }, conv: Conversation) => {
    console.log("trying to save message: " + content.slice(0, 200));
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: conv.id,
          role,
          content,
        })
      })
    } catch (error) {
      console.error(error);
    }
  } 

  const fetchChatApi = async (chatHistory: ChatMessage[]): Promise<string> => {
    setIsErrorLoadingResponse(false);
    console.log("...loading response")

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatHistory)
      });

      console.log("openAI response::");
      console.log(response);
      const data = await response.json();
      if (data) {
        if (data.message) {
          return data.message;
        } else if (data.error) {
          console.log("error getting openAI response:: ");
          console.log(data.error);
        }
      }
    } catch (error) {
      console.error(error);
    }

    setIsErrorLoadingResponse(true);
    return '';
  }

  const handleSubmitText = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("text submitted: " + userTextInput);

    // would be better to add user's message when response from OpenAI is successfully received so we're not adding extra messages to chat history, but then user's message won't get displayed after submitting
    const userMessage = { "role": "user", "content": userTextInput };
    const updatedHistory = [...messageHistory, userMessage];
    setMessageHistory(updatedHistory);

    let newConvo: Conversation | null = null;
    if (session?.user) {
      if (!activeConversation) {
        newConvo = await createNewConversation();
        console.log("created new conversation::");
        console.log(newConvo);
        if (newConvo) {
          setConversations(prevConvos => [...prevConvos, newConvo as Conversation]);
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
  }

  function startStreamingResponse(chatHistory: ChatMessage[], convo?: Conversation) {
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
            console.log('Connection was closed with partialReponse = ' + partialResponseRef.current.substring(0, 20));
            if (convo && !convo.title) {
              // first AI response just finished
              editConversationTitle(convo.id, 'user: ' + chatHistory[0].content + ' assistant: ' + partialResponseRef.current);
            }
            onResponseFinished(convo);
            setIsLoadingResponse(false);
            break;
          }

          const text = new TextDecoder().decode(value);
          //console.log('received chunk: ', text);
          setPartialResponse(prevRes => prevRes + text);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchChatResponse();
  }

  function onResponseFinished(convo?: Conversation) {
    const aiMsg = { "role": "assistant", "content": partialResponseRef.current };
    setMessageHistory(prevHistory => [...prevHistory, aiMsg]);
    if (convo) {
      console.log('trying to save message with convo::');
      console.log(convo);
      saveMessage(aiMsg, convo);
    }

    setPartialResponse('');
  }

  async function editConversationTitle(convoId: string, text: string) {
    const getChatTitleFromAI = async (chatText: string): Promise<string> => {
      try {
        const response = await fetch('/api/chatTitle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: chatText })
        });

        const data = await response.json();
        return data.title;
      } catch (error) {
        console.error(error);
      }
      return '';
    }

    console.log("retrieving title");
    const title = await getChatTitleFromAI(text);
    console.log("AI has created new title: " + title);
    setConversations(prevConvos => prevConvos.map(convo => {
      if (convo.id === convoId) {
        convo.title = title;
        return convo;
      } else return convo;
    }))
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
  }

  function handleConversationClicked(convId: string) {
    const fetchConversationMessages = async () => {
      try {
        const response = await fetch(`api/conversation?id=${convId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const conv = await response.json() as ConversationExt;
        if (conv) {
          conv.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const msgHist: ChatMessage[] = [];
          conv.messages.map(message => {
            msgHist.push({ 'role': message.role, 'content': message.content });
          })
          setMessageHistory(msgHist);
          setActiveConversation(conv);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchConversationMessages();
  }

  function handleDeleteConversation(convoId: string) {
    const deleteAllMessagesInConversation = async () => {
      try {
        const response = await fetch(`api/message?conversationId=${convoId}`, {
          method: 'DELETE'
        });

        if (response.status === 200) {
          console.log("Deleted messages for conversation: " + convoId);
        }
      } catch (error) {
        console.error(error);
      }
    }

    const deleteConversation = async () => {
      try {
        const response = await fetch(`api/conversation?id=${convoId}`, {
          method: 'DELETE',
        })

        if (response.status === 200) {
          console.log("Deleted conversation: " + convoId);
        }
      } catch (error) {
        console.error(error);
      }
    }

    const deleteInOrder = async () => {
      await deleteAllMessagesInConversation();
      deleteConversation();
      if (activeConversation && activeConversation.id === convoId) {
        clearActiveConversation();
      }
      setConversations(prevConvos => prevConvos.filter(convo => convo.id !== convoId));
    }

    deleteInOrder();
  }

  function clearActiveConversation() {
    setMessageHistory([]);
    setActiveConversation(undefined);
  }

  return (
    <>
      <main className="mt-8 min-h-screen" aria-label="Chat with Harry">
        <ChatSidebar conversations={conversations} conversationClicked={handleConversationClicked} handleDeleteConversation={handleDeleteConversation} handleClearConversation={clearActiveConversation} />
        <form onSubmit={handleSubmitText}>
          <div className="w-full max-w-md mx-auto px-2">
            <input
              type="text"
              value={userTextInput}
              onChange={(e) => setUserTextInput(e.target.value)}
              className="w-full rounded-xl h-12 p-3 border-gray-300 border-2"
              placeholder="Chat with Harry..."
              aria-label="Chat input"
            />
          </div>
        </form>
        {isLoadingResponse &&
          <p className="text-lg italic text-center">Harry is thinking...</p>
        }
        {isErrorLoadingResponse &&
          <p className="border border-red-600 max-w-7xl mx-auto p-4" role="alert">Error loading response. Please try again.</p>
        }
        <section className="flex flex-col max-w-5xl mx-auto pt-10 px-2" aria-label="Chat history">
          {partialResponse && partialResponse !== '' &&
            <div className={`border-amber-300 flex flex-col sm:flex-row gap-y-2 border rounded-xl p-4 mb-8`}>
              <h4 className={`text-amber-200 basis-1/6 font-bold text-lg leading-5 sm:text-right pr-4`}>Harry Howard:</h4>
              <p className="basis-5/6 ps-3">{partialResponse}</p>
            </div>
          }
          {messageHistory && messageHistory.slice().reverse().map((msg, i) => {
            const speaker =
              msg.role === 'user' ? 'You:' :
                msg.role === 'assistant' ? 'Harry Howard:' :
                  '';

            let border = 'border-slate-200';
            let textColor = '';

            if (msg.role === 'assistant') {
              border = 'border-amber-300';
              textColor = 'text-amber-200';
            }

            return (
              <div className={`${border} flex flex-col sm:flex-row gap-y-2 border rounded-xl p-4 mb-8`} key={i}>
                <h4 className={`${textColor} basis-1/6 font-bold text-lg leading-5 sm:text-right pr-4`}>{speaker}</h4>
                <p className="basis-5/6 ps-3">{msg.content}</p>
              </div>
            )
          })}
        </section>
      </main>
    </>
  )
}