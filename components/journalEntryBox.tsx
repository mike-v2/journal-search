'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Josefin_Sans } from 'next/font/google';
import Image from 'next/image';

import { JournalEntry } from '@prisma/client';

import { dateToJournalDate, makeDatePretty } from '@/utils/convertDate';
import JournalTopicBox from '@/components/journalTopicBox';
import PostModal from './postModal';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
});

type EntryBoxProps = JournalEntry & {
  onStarRemoved?: (journalEntryId: string) => void;
};

const sqrt2 = 1.414;
const cornerDiagonalSmall = 12; // corner fold size when unsaved
const cornerDiagonalLarge = 26; // corner fold size when saved

export default function JournalEntryBox({
  id,
  date,
  startPage,
  endPage,
  content,
  onStarRemoved,
}: EntryBoxProps) {
  const { data: session } = useSession();
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [isRead, setIsRead] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<string>('text');
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [cornerCutoutDiagonal, setCornerCutoutDiagonal] =
    useState<string>('14px');
  const [cornerFoldWidth, setCornerFoldWidth] = useState<string>('20px');
  const [isCornerHovered, setIsCornerHovered] = useState<boolean>(false);

  useEffect(() => {
    async function checkIsStarred() {
      if (!session || !session.user) {
        return;
      }

      const res = await fetch(
        `/api/starredEntry?userId=${session.user.id}&journalEntryId=${id}`,
        {
          method: 'GET',
        },
      );
      const { currentIsStarred } = await res.json();

      setIsStarred(currentIsStarred);
    }

    async function checkIsRead() {
      if (!session || !session.user) {
        return;
      }

      const res = await fetch(
        `/api/readEntry?userId=${session.user.id}&journalEntryId=${id}`,
        {
          method: 'GET',
        },
      );
      const { currentIsRead } = await res.json();

      setIsRead(currentIsRead);
    }

    checkIsStarred();
    checkIsRead();
  }, [id, session]);

  useEffect(() => {
    async function fetchJournalImagePaths() {
      if (!startPage || !endPage) return;

      let d = date;
      if (typeof date === 'string') {
        d = new Date(date);
      }
      const year = d.toISOString().split('-')[0];

      try {
        const res = await fetch(
          `/api/journalEntryImage?year=${year}&startPage=${startPage}&endPage=${endPage}`,
        );
        const data = await res.json();

        setImagePaths(data);
      } catch (error) {
        console.log(error);
      }
    }

    fetchJournalImagePaths();
  }, [startPage, endPage, date]);

  useEffect(() => {
    const cornerWidthSmall = sqrt2 * cornerDiagonalSmall;
    const cornderWidthLarge = sqrt2 * cornerDiagonalLarge;

    if (isCornerHovered) {
      setCornerCutoutDiagonal(
        isStarred ? `${cornerDiagonalSmall}px` : `${cornerDiagonalLarge}px`,
      );
      setCornerFoldWidth(
        isStarred ? `${cornerWidthSmall}px` : `${cornderWidthLarge}px`,
      );
    } else {
      setCornerCutoutDiagonal(
        isStarred ? `${cornerDiagonalLarge}px` : `${cornerDiagonalSmall}px`,
      );
      setCornerFoldWidth(
        isStarred ? `${cornderWidthLarge}px` : `${cornerWidthSmall}px`,
      );
    }
  }, [isCornerHovered, isStarred]);

  async function handleStarClick() {
    if (!session || !session.user) {
      signIn();
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
      signIn();
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

  function openModal() {
    if (!session || !session.user) {
      signIn();
      return;
    }

    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <article
      className={`${isRead ? 'opacity-50' : ''}`}
      style={
        {
          '--corner-cutout-diagonal': cornerCutoutDiagonal,
          '--corner-fold-width': cornerFoldWidth,
        } as React.CSSProperties
      }
    >
      <div className='relative'>
        <button
          className='absolute right-0 top-0 z-10 h-12 w-12 cursor-pointer'
          onMouseEnter={(e) => setIsCornerHovered(true)}
          onMouseLeave={(e) => setIsCornerHovered(false)}
          onClick={handleStarClick}
          aria-label='Save Entry Clickable Area'
        ></button>
        <div className='absolute right-0 top-0 mr-6 mt-3 h-12 w-12 italic'>
          {isStarred ? 'Unsave' : 'Save'}
        </div>
        <div
          className={`corner-fold absolute right-[2px] top-[2px] shadow-xl shadow-black`}
        ></div>
      </div>
      <div
        className={`${josefin.className} corner-cut-out h-fit whitespace-pre-wrap border-2 border-slate-400 p-2 pb-16 md:p-8`}
      >
        <section className='my-16 flex md:my-8'>
          <div
            className='dropdown dropdown-bottom w-12'
            role='menu'
            aria-label='Dropdown Menu'
          >
            <label
              tabIndex={0}
              className='btn m-1 border-none bg-transparent p-0'
              role='button'
              aria-label='Kebab Icon Button'
            >
              <Image
                src='/images/kebab_icon.svg'
                className=''
                width={50}
                height={50}
                alt='kebab icon'
              />
            </label>
            <ul
              tabIndex={0}
              className='dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow'
            >
              <li>
                <div
                  className='btn-group my-auto gap-0'
                  role='radiogroup'
                  aria-label='Display Options'
                >
                  <label
                    htmlFor={`image ${date}`}
                    className={`btn h-10 min-h-0 w-10 p-0  ${
                      displayMode === 'image'
                        ? 'btn-active'
                        : 'border-none bg-transparent'
                    }`}
                  >
                    <input
                      type='radio'
                      id={`image ${date}`}
                      name={`options ${date}`}
                      className='hidden'
                      onClick={() => {
                        setDisplayMode('image');
                      }}
                    />
                    <Image
                      src='/images/book_icon.svg'
                      className='invert'
                      width={23}
                      height={23}
                      alt='display image button'
                    />
                  </label>
                  <label
                    htmlFor={`text ${date}`}
                    className={`btn h-10 min-h-0 w-10 p-0 ${
                      displayMode === 'text'
                        ? 'btn-active'
                        : 'border-none bg-transparent'
                    }`}
                  >
                    <input
                      type='radio'
                      id={`text ${date}`}
                      name={`options ${date}`}
                      className='hidden'
                      onClick={() => setDisplayMode('text')}
                    />
                    <Image
                      src='/images/text_icon.svg'
                      className='invert'
                      width={18}
                      height={18}
                      alt='display text button'
                    />
                  </label>
                </div>
              </li>
              <li>
                <button onClick={openModal}>Create Post</button>
              </li>
            </ul>
          </div>
          <PostModal
            isOpen={isModalOpen}
            closeModal={closeModal}
            journalEntryId={id}
            userId={session?.user.id}
          />

          <button
            className={`relative my-auto ml-auto flex h-16 w-16 cursor-pointer flex-col justify-center rounded-sm border border-slate-400`}
            onClick={handleReadClick}
            aria-label='Mark Read Button'
          >
            {isRead && <Image src='/images/stamp.jpg' fill alt='stamp' />}
            {!isRead && (
              <p className='mx-auto text-center'>
                Mark
                <br />
                Read
              </p>
            )}
          </button>
        </section>

        <h3 className='my-6 p-4 text-center text-3xl font-bold text-slate-800'>
          {makeDatePretty(dateToJournalDate(date))}
        </h3>

        <div className='flex flex-col gap-x-4 gap-y-6 md:flex-row'>
          <div className='md:w-1/3'>
            <JournalTopicBox journalEntryId={id} />
          </div>
          <div className='w-full md:w-2/3'>
            <div className={`${displayMode !== 'text' ? 'hidden' : ''}`}>
              <p className='text-left text-slate-800'>
                {content !== '' &&
                  content.replace(/\\n/g, '\n').replace(/\\t/g, '     ')}
              </p>
            </div>
            <div
              className={`${
                displayMode !== 'image' ? 'hidden' : ''
              } flex flex-wrap justify-center`}
            >
              {imagePaths && imagePaths[currentImageIndex] && (
                <div>
                  <Image
                    src={imagePaths[currentImageIndex]}
                    width={600}
                    height={800}
                    alt={`journal image ${currentImageIndex}`}
                    key={`${date}-${currentImageIndex}`}
                  />
                  <div className='btn-group flex justify-center'>
                    <button
                      className={`btn h-16 w-16 ${
                        currentImageIndex <= 0 ? 'btn-disabled' : ''
                      }`}
                      onClick={() =>
                        setCurrentImageIndex((prevIndex) => prevIndex - 1)
                      }
                      aria-label='Previous Image Button'
                    >
                      {'<'}
                    </button>
                    <button
                      className={`btn h-16 w-16 ${
                        currentImageIndex >= imagePaths.length - 1
                          ? 'btn-disabled'
                          : ''
                      }`}
                      onClick={() =>
                        setCurrentImageIndex((prevIndex) => prevIndex + 1)
                      }
                      aria-label='Next Image Button'
                    >
                      {'>'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
