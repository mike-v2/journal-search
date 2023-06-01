import { dateToJournalDate, makeDatePretty } from "@/utils/convertDate";
import Pagination from "@etchteam/next-pagination";
import { JournalEntry, JournalTopic } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Josefin_Sans } from "next/font/google";
import Image from "next/image";
import { ReactEventHandler, useEffect, useRef, useState } from "react";
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
  const [isRead, setIsRead] = useState<boolean>(false);
  const [topics, setTopics] = useState<JournalTopic[]>([]);
  const [displayMode, setDisplayMode] = useState<string>("text");
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [postText, setPostText] = useState<string>('');
  const [cornerCutoutWidth, setCornerCutoutWidth] = useState<string>('1.2rem');
  const [cornerFoldWidth, setCornerFoldWidth] = useState<string>('1.2rem');
  const [isCornerHovered, setIsCornerHovered] = useState<boolean>(false);


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

      const { currentIsStarred } = await res.json();
      setIsStarred(currentIsStarred);
    }

    async function checkIsRead() {
      if (!session || !session.user) {
        return;
      }

      const res = await fetch(`/api/readEntry?userId=${session.user.id}&journalEntryId=${id}`, {
        method: 'GET',
      });

      const { currentIsRead } = await res.json();
      setIsRead(currentIsRead);
    }

    fetchTopics();
    checkIsStarred();
    checkIsRead();
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

  useEffect(() => {
    if (isCornerHovered) {
      setCornerCutoutWidth(isStarred ? '.8rem' : '1.8rem');
      setCornerFoldWidth(isStarred ? '1.2rem' : '2.8rem');
    } else {
      setCornerCutoutWidth(isStarred ? '1.8rem' : '.8rem');
      setCornerFoldWidth(isStarred ? '2.8rem' : '1.2rem');
    }

  }, [isCornerHovered, isStarred]);

  async function handleStarClick() {
    if (!session || !session.user) {
      return;
    }

    try {
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
        if (!currentIsStarred && isStarred) {
          if (onStarRemoved) onStarRemoved(id);
        }
        setIsStarred(!!currentIsStarred);
      }
    } catch (error) {
      console.error('Error starring journal entry:', error);
    }
  }

  async function handleReadClick() {
    if (!session || !session.user) {
      return;
    }

    try {
      const entryData = {
        userId: session.user.id,
        journalEntryId: id,
        isRead: isRead,
      };

      const res = await fetch(`/api/readEntry`, {
        body: JSON.stringify(entryData),
        method: 'POST',
      });

      if (res.status === 200) {
        const { currentIsRead } = await res.json();
        /* if (!currentIsRead && isRead) {
          if (onStarRemoved) onStarRemoved(id);
        } */
        setIsRead(!!currentIsRead);
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
      const summaryLength = 50;
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

  function handleHoverCorner() {
    setIsCornerHovered(true);
  }

  function handleUnhoverCorner() {
    setIsCornerHovered(false);
  }

  return (
    <div className={`${isRead ? 'opacity-50' : ''}`} style={{
      '--corner-cutout-width': cornerCutoutWidth,
      '--corner-fold-width': cornerFoldWidth,
    } as React.CSSProperties}>
      {session?.user &&
        <div className="relative">
          <div 
            className="absolute top-0 right-0 w-12 h-12 z-10 cursor-pointer" 
          onMouseEnter={handleHoverCorner} 
          onMouseLeave={handleUnhoverCorner} 
          onClick={handleStarClick} 
          ></div>
          <div className="absolute top-0 right-0 w-12 h-12 mt-3 mr-6 italic">
            {isStarred ? 'Unsave' : 'Save'}
          </div>
          <div className="corner-fold absolute top-0 right-0 shadow-xl shadow-black" ></div>
        </div>
      }
      <div className={`${josefin.className} corner-cut-out h-fit p-8 border-2 border-slate-400 whitespace-pre-wrap`}>
        <div className="flex my-8" >
          <div className="dropdown dropdown-bottom w-12">
            <label tabIndex={0} className="btn m-1 p-0 bg-transparent border-none">
              <Image src="/images/kebab_icon.svg" className="" width={50} height={50} alt="kebab icon" />
            </label>
            {session?.user &&
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <div className="btn-group my-auto gap-0">
                    <label htmlFor={`image ${date}`} className={`btn min-h-0 h-10 w-10 p-0  ${displayMode === 'image' ? 'btn-active' : 'bg-transparent border-none'}`}>
                      <input type="radio" id={`image ${date}`} name={`options ${date}`} className="hidden" onClick={() => { setDisplayMode('image'); }} />
                      <Image src='/images/book_icon.svg' className="invert" width={23} height={23} alt='display image button' />
                    </label>
                    <label htmlFor={`text ${date}`} className={`btn min-h-0 h-10 w-10 p-0 ${displayMode === 'text' ? 'btn-active' : 'bg-transparent border-none'}`}>
                      <input type="radio" id={`text ${date}`} name={`options ${date}`} className="hidden" onClick={() => setDisplayMode('text')} />
                      <Image src='/images/text_icon.svg' className="invert" width={18} height={18} alt='display text button' />
                    </label>
                  </div>
                </li>
                <li><a onClick={openModal}>Create Post</a></li>
              </ul>
            }
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

          <div className={`w-16 h-16 my-auto ml-auto relative flex flex-col justify-center cursor-pointer border rounded-sm border-slate-400`} onClick={handleReadClick}>
            {isRead && <Image src='/images/stamp.jpg' fill alt='stamp' />}
            {!isRead && <p className="text-center">Mark<br />Read</p>}
          </div>
        </div>
        <div className="flex flex-col w-full bg-amber-200 p-6">
          {topics && topics.map((topic) => {
            return (
              <div className='flex-auto py-2 px-4 my-auto' key={topic.summary.slice(0, 25)}>
                <div className="flex">
                  <div className="basis-10 flex-none my-auto">
                    {getTopicIconPath(topic) && <Image src={getTopicIconPath(topic)} className="" width={25} height={25} alt={topic.name + " icon"} />}
                  </div>
                  <div className="flex flex-col pl-2 truncate">
                    <p className="flex-auto capitalize text-lg font-bold text-slate-800 my-auto">
                      {`${topic.name}`}
                    </p>
                    <p className="flex-auto truncate text-sm text-slate-600 my-auto">
                      {getTopicSubheading(topic)}
                    </p>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
        <p className="text-2xl font-bold p-4 mt-10 text-center text-slate-800">
          {makeDatePretty(dateToJournalDate(date))}
        </p>
        <div className={`${displayMode === 'text' ? '' : 'hidden'}`}>
          <p className="p-4 text-slate-800">
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
    </div>
  )
}