import { useRef, useState } from "react"

type Message = {
  role: string,
  content: string,
}

export default function Chat() {
  const [msgHistory, setMsgHistory] = useState<Message[]>([]);
  const textBox = useRef<HTMLTextAreaElement>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);

  function handleTextChange() {
    if (textBox.current) {
      let text = textBox.current.value;
      if (text.charAt(text.length - 1) === '\n') {
        textBox.current.value = textBox.current.value.slice(0, text.length - 1);
        handleSubmitText();
        textBox.current.value = '';
      }
    }
  }

  async function handleSubmitText() {
    if (textBox.current) {
      let text = textBox.current.value;
      console.log("text submitted: " + text);
      /* setMsgHistory(prevHistory => {
        const updatedHistory = [...prevHistory, { "role": "user", "content": text }];

        const fetchChatApi = async () => {
          console.log("fetching chat response with chat history::");
          console.log(updatedHistory);
          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedHistory)
            });

            const data = await response.json();
            console.log("setting new response: " + data);
            setMsgHistory(prev => [...prev, { "role": "assistant", "content": data }]);
          } catch (error) {
            console.error('Error:', error);
          }
        }

        fetchChatApi();

        return updatedHistory;
      }); */
      //use the following method instead so that strict mode doesn't cause double fetch calls
      const updatedHistory = [...msgHistory, { "role": "user", "content": text }];
      setMsgHistory(updatedHistory);

      const fetchChatApi = async () => {
        setIsLoadingResponse(true);

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedHistory)
          });

          const data = await response.json();
          console.log("data received from openAI:: ");
          console.log(data);
          if (data) {
            if (data.message) {
              setMsgHistory(prev => [...prev, { "role": "assistant", "content": data.message }]);
            } else if (data.error) {
              console.log("error getting openAI response:: ");
              console.log(data.error);
            }
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoadingResponse(false);
        }
      }

      fetchChatApi();
    }
  }

  return (
    <div className="mt-16 min-h-screen">
      <div className="w-full">
        <div className="w-3/4 max-w-4xl mx-auto">
          <textarea ref={textBox} onChange={handleTextChange} className="w-full rounded-xl h-12 p-3" placeholder="chat with Harry..." />
        </div>
      </div>
      <div className="w-12 h-12 mx-auto">
        <span className="loading loading-dots loading-md"></span>
      </div>
      {isLoadingResponse &&
        <p className="text-lg italic text-center">Harry is thinking...</p>
      }
      <div className="flex flex-col w-11/12 max-w-7xl mx-auto pt-10">
        {msgHistory && msgHistory.slice().reverse().map((msg, i) => {
          const speaker =
            msg.role === 'user' ? 'You:' :
              msg.role === 'assistant' ? 'Harry Howard:' :
                '';

          return (
            <div className="flex pb-8" key={i}>
              <span className="basis-1/6 font-bold text-lg leading-5 text-right">{speaker}</span>
              <span className="basis-5/6 ps-3">{msg.content}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}