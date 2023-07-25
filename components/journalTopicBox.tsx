import { useEffect, useState } from "react";
import { makeDatePretty } from "@/utils/convertDate";
import { JournalEntry, JournalTopic } from "@prisma/client";
import Image from "next/image";

export default function JournalTopicBox(journalEntry: JournalEntry) {
  const [topics, setTopics] = useState<JournalTopic[]>([]);

  useEffect(() => {
    async function fetchTopics() {
      const res = await fetch(`/api/journalTopic?journalEntryId=${journalEntry.id}`, {
        method: 'GET',
      });

      const topics = await res.json();
      setTopics(topics);
    }

    fetchTopics();
  }, [journalEntry]);

  function getTopicIconPath(topic: JournalTopic): string {
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

  function getTopicSubheading(topic: JournalTopic): string {
    let subheading = '';

    if (Math.abs(topic.strength) > .5) {
      subheading = topic.emotion;
    } else if (topic.people.length > 0) {
      subheading = topic.people.slice(0, 3).join(', ');
    } else if (topic.organizations.length > 0) {
      subheading = topic.organizations.slice(0, 3).join(', ');
    } else if (topic.things.length > 0) {
      subheading = topic.things.slice(0, 3).join(', ');
    } else if (topic.places.length > 0) {
      subheading = topic.places.slice(0, 3).join(', ');
    } else {
      const summaryLength = 50;
      const summaryWords = topic.summary.split(' ');
      subheading = summaryWords.slice(0, summaryLength).join(' ');
      if (summaryWords.length > summaryLength) {
        subheading += '...';
      }
    }

    return subheading.charAt(0).toUpperCase() + subheading.slice(1);
  }

  return (
    <div className="h-fit w-full max-w-sm bg-amber-200 p-6 mx-auto md:px-2" aria-label="topics">
      <div className="flex flex-col sm:w-full mx-auto">
        {topics && Array.isArray(topics) && topics.map((topic) => {
          return (
            <div className='flex-auto py-2 md:px-4 my-auto mx-auto sm:mx-0' key={topic.summary.slice(0, 25)}>
              <div className="flex flex-col">
                <div className="flex">
                  {getTopicIconPath(topic) &&
                    <div className="basis-10 flex-none">
                      <Image src={getTopicIconPath(topic)} className="" width={25} height={25} alt={topic.name + " icon"} />
                    </div>
                  }
                  <p className="flex-auto capitalize whitespace-pre-wrap md:truncate text-lg font-bold text-slate-800">
                    {`${topic.name}`}
                  </p>
                </div>
                <p className="hidden sm:block flex-auto truncate text-sm text-slate-600 my-auto">
                  {getTopicSubheading(topic)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}