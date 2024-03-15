import Image from 'next/image';

import JournalEntryBox from '@/components/journalEntryBox';
import { PostExt } from '@/types/prismaExtensions';
import { databaseDateToPrettyDate, timestampToDate } from '@/utils/convertDate';

import Comments from '@/app/community/components/comments';

export default function PostBox({
  id,
  journalEntry,
  createdBy,
  createdAt,
  title,
  text,
  comments,
}: PostExt) {
  return (
    <details>
      <summary
        className='list-none rounded-xl p-4 text-white hover:bg-amber-300 hover:text-black'
        aria-label='User post'
      >
        <div className='flex flex-col gap-x-6 gap-y-4 sm:flex-row'>
          <div className='text-xl font-medium '>
            <p>{databaseDateToPrettyDate(journalEntry.date)}</p>
            <p>{title.slice(0, 150)}</p>
          </div>
          <div className='sm:ms-auto'>
            <div className='flex gap-x-2'>
              <div className='flex-none'>
                {createdBy.image && (
                  <Image
                    src={createdBy.image}
                    className='rounded-full'
                    width={50}
                    height={50}
                    alt={`${createdBy.name}'s avatar`}
                  />
                )}
              </div>
              <div className='flex flex-col justify-center'>
                <p>{createdBy.name}</p>
                <p className='whitespace-nowrap text-sm italic'>
                  {timestampToDate(new Date(createdAt).toISOString())}
                </p>
              </div>
            </div>
          </div>
        </div>
      </summary>
      <article
        className='mx-auto flex flex-col'
        aria-label='posted journal entry'
      >
        <div className='md:px-2'>
          <JournalEntryBox {...journalEntry} />
        </div>
        <div className='mb-16 mt-8 px-4'>
          <p>{text}</p>
        </div>

        <Comments comments={comments} postId={id} />
      </article>
    </details>
  );
}
