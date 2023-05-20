import { dateToJournalDate, makeDatePretty } from "@/utils/convertDate";
import Pagination from "@etchteam/next-pagination";
import { JournalEntry, JournalTopic } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Josefin_Sans } from "next/font/google";
import Image from "next/image";
import { ReactEventHandler, useEffect, useState } from "react";
import Modal from 'react-modal';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#__next');

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
});

interface EntryBoxProps extends JournalEntry {
  onStarRemoved?: (journalEntryId: string) => void,
}

export default function JournalEntryBox({ id, date, startPage, endPage, content, onStarRemoved}: EntryBoxProps) {
  const {data: session} = useSession();
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [topics, setTopics] = useState<JournalTopic[]>([]);
  const [displayMode, setDisplayMode] = useState<string>("text");
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [postText, setPostText] = useState<string>('');

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
      console.log("star clicked. isStarred = " + isStarred);

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
        const { currentIsStarred } = await res.json();
        console.log("setting isStarred = " + currentIsStarred);
        if (!currentIsStarred && isStarred) {
          console.log("on star removed")
          if (onStarRemoved) onStarRemoved(id);
        }
        setIsStarred(!!currentIsStarred);
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

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setPostText('');
    setModalIsOpen(false);
  }

  async function handleCreatePost(e: React.MouseEvent<HTMLFormElement>) {
    e.preventDefault();

    if (session?.user) {
      try {
        const res = await fetch('/api/post', {
          method: 'POST',
          body: JSON.stringify({
            journalEntryId: id,
            userId: session?.user.id,
            text: postText,
          }),
        })

        if (res.status === 200) {
          const data = await res.json();
          //console.log(data.message)
        }
      } catch (error) {
        console.log("error creating post: " + error);
      }
    }
    
    closeModal();
  }

  return (
    <div className={`${josefin.className} h-fit p-4 border-2 border-slate-400 whitespace-pre-wrap`}>
      <div className="flex">
        <div className="flex-auto flex justify-start py-4">
          <div className="btn-group px-4">
            <label htmlFor={`image ${date}`} className={`btn min-h-0 h-10 w-10 p-0 ${displayMode === 'image' ? 'btn-active' : ''}`}>
              <input type="radio" id={`image ${date}`} name={`options ${date}`} className="hidden" onClick={() => { setDisplayMode('image');}} />
              <Image src='/images/book_icon.svg' width={25} height={25} alt='display image button' />
            </label>
            <label htmlFor={`text ${date}`} className={`btn min-h-0 h-10 w-10 p-0 ${displayMode === 'text' ? 'btn-active' : ''}`}>
              <input type="radio" id={`text ${date}`} name={`options ${date}`} className="hidden" onClick={() => setDisplayMode('text')} />
              <Image src='/images/text_icon.svg' width={20} height={20} alt='display text button' />
            </label>
          </div>
        </div>
        <div className="flex-auto flex justify-end my-auto">
          {session?.user &&
            <div className={'flex mx-4 ' + (isStarred ? 'filter-yellow' : 'filter-gray')} onClick={() => handleStarClick()}>
              <Image src='/images/star_icon.svg' width={30} height={30} alt='display text button' />
            </div>
          }
          <div className="dropdown dropdown-bottom dropdown-end w-12">
            <label tabIndex={0} className="btn m-1 p-0 bg-transparent">
              <Image src="/images/kebab_icon.svg" className="invert" width={50} height={50} alt="kebab icon" />
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              {session?.user && 
                <li><a onClick={openModal}>Create Post</a></li>
              }
            </ul>
          </div>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="m-auto p-5 border rounded-md max-w-md bg-slate-800"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex"
          >
            <form onSubmit={handleCreatePost}>
              <h2 className="mb-3 text-xl text-slate-200">Create Post</h2>
              <textarea
                className="w-full mb-3 p-2 border rounded-md"
                value={postText}
                onChange={e => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                required
              />
              <div className="flex justify-end">
                <button className="mr-2 px-3 py-1 bg-gray-300 text-black rounded-md" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-md">
                  Post
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
      
      <div className="flex flex-wrap w-fit max-w-full bg-amber-300 mx-auto p-2 px-4">
        {topics && topics.map((topic) => {
          return (
            <div className='flex-auto p-1 px-4' key={topic.summary.slice(0, 25)}>
              <div className="flex justify-center">
                {getTopicIconPath(topic) && <Image src={getTopicIconPath(topic)} className="me-2" width={30} height={30} alt={topic.name + " icon"} />}
                <p className="my-auto capitalize text-center font-bold text-slate-800">
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
      <div className={`${displayMode === 'text' ? '' : 'hidden'}`}>
        <p className="p-4">
          {content !== '' && content.replace(/\\n/g, '\n').replace(/\\t/g, '     ')}
        </p>
      </div>
      <div className={`${displayMode === 'image' ? '' : 'hidden'} flex justify-center flex-wrap`}>
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