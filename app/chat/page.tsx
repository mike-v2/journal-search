'use client'

import ChatSidebar from "@/components/chatSidebar";
import { Conversation, Message } from "@prisma/client";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react"

type MessageCore = {
  role: string,
  content: string,
}

type ConversationExt = Conversation & {
  messages: Message[],
}

export default function Chat() {
  const { data: session } = useSession();
  const [messageHistory, setMessageHistory] = useState<MessageCore[]>([]);
  const textBox = useRef<HTMLTextAreaElement>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);
  const [isErrorLoadingResponse, setIsErrorLoadingResponse] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationExt>();
  const [partialResponse, setPartialResponse] = useState<string>('');
  const partialResponseRef = useRef(partialResponse);

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

  function handleTextChange() {
    if (textBox.current) {
      let text = textBox.current.value;
      if (text.charAt(text.length - 1) === '\n' && !isLoadingResponse) {
        textBox.current.value = textBox.current.value.slice(0, text.length - 1);
        handleSubmitText();
        textBox.current.value = '';
      }
    }
  }

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
    console.log("trying to save message: " + content);
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: conv.id,
          role: role,
          content: content,
        })
      })
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmitText() {
    if (!textBox.current) return;

    const userText = textBox.current.value;
    console.log("text submitted: " + userText);

    // would be better to add user's message when response from OpenAI is successfully received so we're not adding extra messages to chat history, but then user's message won't get displayed after submitting
    const userMessage = { "role": "user", "content": userText };
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
  }

  function startStreamingResponse(chatHistory: MessageCore[], convo?: Conversation) {
    setIsLoadingResponse(true);

    const eventSource = new EventSource(`/api/chat?chatHistory=${JSON.stringify(chatHistory)}`);

    eventSource.onmessage = function (event) {
      console.log("received data from stream: " + event.data);
      console.log("ready state = " + eventSource.readyState);
      if (event.data === "end_of_stream") {
        console.log('Connection was closed with partialReponse = ' + partialResponseRef.current.substring(0, 20));
        if (chatHistory.length === 1 && convo) {
          // first AI response just finished
          editConversationTitle(convo.id, 'user: ' + chatHistory[0].content + ' assistant: ' + partialResponseRef.current);
        }
        onResponseFinished(convo);
        setIsLoadingResponse(false);
        eventSource.close();
      } else {
        console.log('adding to partial response: ' + event.data);
        setPartialResponse(prevRes => prevRes + event.data);
      }
    };

    eventSource.onerror = function (error) {
      console.error('Stream error:', error);
      eventSource.close();
      setPartialResponse('');
      setIsLoadingResponse(false);
    };

    return () => {
      eventSource.close();
    };
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
            'Content-Type': 'text/plain',
          },
          body: chatText
        });

        const data = await response.json();
        return data.title;
      } catch (error) {
        console.error(error);
      }
      return '';
    }

    console.log("retrieving title for text: " + text);
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
          const msgHist: MessageCore[] = [];
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
        <div className="w-full">
          <div className="w-full max-w-md mx-auto px-2">
            <textarea
              ref={textBox}
              onChange={handleTextChange}
              className="w-full rounded-xl h-12 p-3"
              placeholder="Chat with Harry..."
              aria-label="Chat input"
            />
          </div>
        </div>
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