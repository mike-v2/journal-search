import { dateToJournalDate, makeDatePretty } from "@/utils/convertDate";
import Pagination from "@etchteam/next-pagination";
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
  const [selected, setSelected] = useState<string>("text");
  const [imagePaths, setImagePaths] = useState<string[]>();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    console.log("current image index = " + currentImageIndex);
    console.log("num paths = " + imagePaths?.length);
  }, [currentImageIndex])
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

  useEffect(() => {
    async function fetchJournalImagePaths() {
      if (!startPage || !endPage) return;

      const year = '1948';
      try {
        const res = await fetch(`/api/journalEntryImage?year=${year}&startPage=${startPage}&endPage=${endPage}`);
        const data = await res.json();

        setImagePaths(data);
      } catch (error) {
        console.log(error);
      }
    }
    
    fetchJournalImagePaths();
  }, [startPage, endPage]);
  
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
      <div className="flex justify-end py-4">
        {session?.user && <div className={'w-8 h-8' + (isStarred ? ' bg-yellow-400' : ' bg-black')} onClick={() => handleStarClick()}></div>}
        <div className="btn-group">
          <label htmlFor={`image ${date}`} className={`btn ${selected === 'image' ? 'btn-active' : ''}`}>
            <input type="radio" id={`image ${date}`} name={`options ${date}`} className="hidden" onClick={() => {setSelected('image'); console.log('set to image')}} />
            <Image src='/images/book_icon.svg' width={25} height={25} alt='display image button' />
          </label>
          <label htmlFor={`text ${date}`} className={`btn ${selected === 'text' ? 'btn-active' : ''}`}>
            <input type="radio" id={`text ${date}`} name={`options ${date}`} className="hidden" onClick={() => setSelected('text')} />
            <Image src='/images/text_icon.svg' width={20} height={20} alt='display text button' />
          </label>
        </div>
      </div>
      <div className="flex flex-wrap w-fit max-w-full bg-amber-300 mx-auto p-2 px-4">
        {topics && topics.map((topic) => {
          return (
            <div className='flex-auto p-1 px-4' key={topic.summary.slice(0, 25)}>
              <div className="flex justify-center">
                {getTopicIconPath(topic) && <Image src={getTopicIconPath(topic)} className="me-2" width={30} height={30} alt={topic.name + " icon"} />}
                <p className=" capitalize text-center font-bold text-slate-800">
                  {topic.name}
                </p>
              </div>
              
              <p className="hidden md:block text-center text-sm text-slate-800">
                {getTopicSubheading(topic)}
              </p>
            </div>
          )
        })}
      </div>
      <p className="text-2xl font-bold p-4 mt-4 text-center text-slate-200">
        {makeDatePretty(dateToJournalDate(date))}
      </p>
      <div className={`${selected === 'text' ? '' : 'hidden'}`}>
        <p className="p-4">
          {content !== '' && content.replace(/\\n/g, '\n').replace(/\\t/g, '     ')}
        </p>
      </div>
      <div className={`${selected === 'image' ? '' : 'hidden'} flex justify-center flex-wrap`}>
        {imagePaths && imagePaths[currentImageIndex] && (
          
          <div>
            <Image src={imagePaths[currentImageIndex]} width={600} height={800} alt={`journal image ${currentImageIndex}`} key={`${date}-${currentImageIndex}`} />
            <div className="btn-group flex justify-center">
              <div className={`btn h-16 w-16 ${currentImageIndex <= 0 ? 'btn-disabled' : ''}`} onClick={() => setCurrentImageIndex(prevIndex => prevIndex - 1)}>{'<'}</div>
              <div className={`btn h-16 w-16 ${currentImageIndex >= imagePaths.length - 1 ? 'btn-disabled' : ''}`} onClick={() => setCurrentImageIndex(prevIndex => prevIndex + 1)}>{'>'}</div>
            </div>
          </div>
        )
        }
      </div>
    </div>
  )
}