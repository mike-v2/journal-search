import { dateToJournalDate, makeDatePretty } from "@/utils/convertDate";
import { JournalEntry, JournalTopic } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface EntryBoxProps extends JournalEntry {
  onChange?: () => void,
}

export default function JournalEntryBox(props: EntryBoxProps) {
  const {data: session} = useSession();
  const [isStarred, setIsStarred] = useState<Boolean>();
  const [topics, setTopics] = useState<JournalTopic[]>();
  
  useEffect(() => {
    fetchTopics();
    checkIsStarred();
  }, [props, session, session?.user]);

  useEffect(() => {
    if (props.onChange) props.onChange();
  }, [isStarred])

  async function fetchTopics() {
    const res = await fetch(`/api/journalTopic?journalEntryId=${props.id}`, {
      method: 'GET',
    });

    const topics = await res.json();
    setTopics(topics);
  }

  async function checkIsStarred() {
    if (!session || !session.user) {
      return;
    }

    const res = await fetch(`/api/starredEntry?userId=${session.user.id}&journalEntryId=${props.id}`, {
      method: 'GET',
    });

    const { isStarred } = await res.json();
    setIsStarred(isStarred);
  }

  async function handleStarClick() {
    if (!session || !session.user) {
      return;
    }

    try {
      console.log("handle star click with isStarred = " + isStarred);
      const entryData = {
        userId: session.user.id,
        journalEntryId: props.id,
        isStarred: isStarred,
      };

      const res = await fetch(`/api/starredEntry`, {
        body: JSON.stringify(entryData),
        method: 'POST',
      });

      if (res.status === 200) {
        const { isStarred } = await res.json();
        console.log((isStarred ? "Star" : "Unstar") + " successful");
        setIsStarred(!!isStarred);
      }
    } catch (error) {
      console.error('Error starring journal entry:', error);
    }
  }

  return (
    <div className="h-fit p-4 border-2 border-slate-400 whitespace-pre-wrap">
      <div className="flex justify-end">
        <div className={'w-8 h-8' + (isStarred ? ' bg-yellow-400' : ' bg-black')} onClick={() => handleStarClick()}></div>
      </div>
      <div className="flex">
        <div className="basis-5/6">
          <div className="text-lg font-bold">
            {makeDatePretty(dateToJournalDate(new Date(props.date)))}
          </div>
          <br />
          <div>
            {props.content !== '' && props.content.replace(/\\n/g, '\n').replace(/\\t/g, '     ')}
          </div>
        </div>
        <div className="flex flex-col basis-1/6 bg-black">
          {topics && topics.map((topic) => {
            return (
              <div className='flex-auto' key={topic.summary.slice(0,25)}>
                <p className="capitalize">
                  {topic.name}
                </p>
                <p>
                  {topic.summary}
                </p>
              </div>
            )
          })}
        </div>
        

      </div>
      
    </div>
  )
}