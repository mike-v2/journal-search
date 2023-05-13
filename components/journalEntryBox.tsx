import { dateToJournalDate, makeDatePretty } from "@/utils/convertDate";
import { JournalEntry, JournalTopic } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface EntryBoxProps extends JournalEntry {
  onChange?: () => void,
}

export default function JournalEntryBox({ id, date, startPage, endPage, content, onChange}: EntryBoxProps) {
  const {data: session} = useSession();
  const [isStarred, setIsStarred] = useState<Boolean>();
  const [topics, setTopics] = useState<JournalTopic[]>();
  
  useEffect(() => {
    async function fetchTopics() {
      const res = await fetch(`/api/journalTopic?journalEntryId=${id}`, {
        method: 'GET',
      });

      const topics = await res.json();
      setTopics(topics);
    }

    async function checkIsStarred() {
      if (!session || !session.user) {
        return;
      }

      const res = await fetch(`/api/starredEntry?userId=${session.user.id}&journalEntryId=${id}`, {
        method: 'GET',
      });

      const { isStarred } = await res.json();
      setIsStarred(isStarred);
    }

    fetchTopics();
    checkIsStarred();
  }, [id, session]);

  useEffect(() => {
    if (onChange) onChange();
  }, [isStarred, onChange])
  
  async function handleStarClick() {
    if (!session || !session.user) {
      return;
    }

    try {
      console.log("handle star click with isStarred = " + isStarred);
      const entryData = {
        userId: session.user.id,
        journalEntryId: id,
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

  function getTopicSubheading(topic: JournalTopic) : string {
    let subheading = '';

    if (Math.abs(topic.strength) > .5) {
      subheading = topic.emotion;
    } else if (topic.people.length > 0) {
      subheading = topic.people.slice(0,3).join(', ');
    } else if (topic.organizations.length > 0) {
      subheading = topic.organizations.slice(0, 3).join(', ');
    } else if (topic.things.length > 0) {
      subheading = topic.things.slice(0, 3).join(', ');
    } else if (topic.places.length > 0) {
      subheading = topic.places.slice(0, 3).join(', ');
    } else {
      const summaryLength = 5;
      const summaryWords = topic.summary.split(' ');
      subheading = summaryWords.slice(0, summaryLength).join(' ');
      if (summaryWords.length > summaryLength) {
        subheading += '...';
      }
    }

    return subheading.charAt(0).toUpperCase() + subheading.slice(1);
  }

  function getTopicIconPath(topic: JournalTopic) : string {
    if (topic.name == 'family') {
      return '/images/family_icon.svg';
    } else if (topic.name == 'travel') {
      return '/images/travel_icon.svg';
    } else if (topic.name == 'religion') {
      return '/images/religion_icon.svg';
    } else if (topic.name == 'finance') {
      return '/images/finance_icon.svg';
    } else if (topic.name == 'weather') {
      return '/images/weather_icon.svg';
    } else if (topic.name == 'home improvement') {
      return '/images/home_improvement_icon.svg';
    } else if (topic.name == 'work') {
      return '/images/work_icon.svg';
    } else if (topic.name == 'correspondence') {
      return '/images/mail_icon.svg';
    } else if (topic.name == 'health') {
      return '/images/health_icon.svg';
    } 

    return '';
  }

  return (
    <div className="h-fit p-4 border-2 border-slate-400 whitespace-pre-wrap">
      <div className="flex justify-end">
        <div className={'w-8 h-8' + (isStarred ? ' bg-yellow-400' : ' bg-black')} onClick={() => handleStarClick()}></div>
      </div>
      <div className="">
        <div className="flex w-fit bg-amber-300 rounded-full mx-auto p-2 px-4">
          {topics && topics.map((topic) => {
            return (
              <div className='flex-auto p-1 px-4' key={topic.summary.slice(0, 25)}>
                <div className="flex justify-evenly">
                  {getTopicIconPath(topic) && <Image src={getTopicIconPath(topic)} width={30} height={30} alt={topic.name + " icon"} />}
                  <p className=" capitalize text-center font-bold text-slate-800 text-lg">
                    {topic.name}
                  </p>
                </div>
                
                <p className="text-center text-sm text-slate-800">
                  {getTopicSubheading(topic)}
                </p>
              </div>
            )
          })}
        </div>
        <p className="text-lg font-bold p-4 mt-4">
          {makeDatePretty(dateToJournalDate(date))}
        </p>
        <p className="p-4">
          {content !== '' && content.replace(/\\n/g, '\n').replace(/\\t/g, '     ')}
        </p>
      </div>
    </div>
  )
}