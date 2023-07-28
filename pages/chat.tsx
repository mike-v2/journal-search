import ChatSidebar from "@/components/chatSidebar";
import { Conversation, Message } from "@prisma/client";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react"

interface MessageCore {
  role: string,
  content: string,
}

interface ConversationExt extends Conversation {
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

  const saveMessage = async ({ role, content }: { role: string, content: string }, conv?: Conversation) => {
    console.log("trying to save message: " + content);
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: conv ? conv.id : activeConversation?.id,
          role: role,
          content: content,
        })
      })
    } catch (error) {
      console.error(error);
    }
  } 

  const fetchChatApi = async (chatHistory: MessageCore[]): Promise<string> => {
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

  async function handleSubmitText() {
    if (!textBox.current) return;

    const userText = textBox.current.value;
    console.log("text submitted: " + userText);

    // would be better to add user's message when response from OpenAI is successfully received so we're not adding extra messages to chat history, but then user's message won't get displayed after submitting
    const userMessage = { "role": "user", "content": userText };
    const updatedHistory = [...messageHistory, userMessage];
    setMessageHistory(updatedHistory);

    let newConvo: Conversation | null = null;
    if (!activeConversation) {
      newConvo = await createNewConversation();
      console.log("created new conv::");
      console.log(newConvo);
      if (newConvo) {
        setConversations(prevConvos => [...prevConvos, newConvo as Conversation]);
        setActiveConversation(newConvo as ConversationExt);
        saveMessage(userMessage, newConvo);
      }
    } else {
      saveMessage(userMessage);
    }

    const convo = activeConversation ?? newConvo;
    if (convo) {
      setIsLoadingResponse(true);
      const aiResponse = await fetchChatApi(updatedHistory);
      if (aiResponse !== '') {
        if (updatedHistory.length === 1) {
          // first AI response just finished
          editConversationTitle(convo.id, 'user: ' + updatedHistory[0].content + ' assistant: ' + aiResponse);
        }
        const aiMsg = { "role": "assistant", "content": aiResponse };
        setMessageHistory(prevHistory => [...prevHistory, aiMsg]);
        console.log('trying to save message with convo::');
        console.log(convo);
        saveMessage(aiMsg, convo);
      }

      setIsLoadingResponse(false);
    }
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
        setMessageHistory([]);
        setActiveConversation(undefined);
      }
      setConversations(prevConvos => prevConvos.filter(convo => convo.id !== convoId));
    }

    deleteInOrder();
  }

  return (
    <>
      <Head>
        <title>Harry&apos;s Journals</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
      </Head>
      <main className="mt-8 min-h-screen" aria-label="Chat with Harry">
        <ChatSidebar conversations={conversations} conversationClicked={handleConversationClicked} handleDeleteConversation={handleDeleteConversation} />
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