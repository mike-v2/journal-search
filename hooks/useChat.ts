import { ConversationExt } from '@/types/prismaExtensions';
import { Conversation } from '@prisma/client';
import { Session } from 'next-auth';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function useChatApi(session: Session | null) {
  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ConversationExt>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);
  const [isErrorLoadingResponse, setIsErrorLoadingResponse] =
    useState<boolean>(false);
  const [partialResponse, setPartialResponse] = useState<string>('');
  const partialResponseRef = useRef(partialResponse);

  useEffect(() => {
    partialResponseRef.current = partialResponse;
  }, [partialResponse]);

  useEffect(() => {
    const loadUserConversations = async () => {
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
      loadUserConversations();
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
      await fetch('/api/message', {
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

  const loadConversationHistory = async (convId: string) => {
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

  async function submitChatMessage(message: string) {
    // would be better to add user's message when response from OpenAI is successfully received so we're not adding extra messages to chat history, but then user's message won't get displayed after submitting
    const userMessage = { role: 'user', content: message };
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
  }

  function clearActiveConversation() {
    setMessageHistory([]);
    setActiveConversation(undefined);
  }

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
            setIsErrorLoadingResponse(true);
            throw new Error('Network response was not ok');
          }

          const reader = response.body?.getReader();
          if (!reader) {
            setIsErrorLoadingResponse(true);
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
          setIsErrorLoadingResponse(true);
          console.error(error);
        }
      }

      fetchChatResponse();
    },
    [editConversationTitle, onResponseFinished],
  );

  const startConversationWithInitialMessages = useCallback(
    async (startMessages: ChatMessage[]) => {
      setMessageHistory(startMessages);

      let newConvo: Conversation | null = null;
      if (session?.user) {
        newConvo = await createNewConversation();
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
    },
    [
      session?.user,
      activeConversation,
      createNewConversation,
      startStreamingResponse,
    ],
  );

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

  return {
    createNewConversation,
    saveMessage,
    loadConversationHistory,
    submitChatMessage,
    clearActiveConversation,
    startStreamingResponse,
    startConversationWithInitialMessages,
    handleDeleteConversation,
    conversations,
    partialResponse,
    messageHistory,
    isLoadingResponse,
    isErrorLoadingResponse,
  };
}
