'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';

import { Comment } from '@prisma/client';

import JournalEntryBox from '@/components/journalEntryBox';
import { PostExt } from '@/types/prismaExtensions';
import { CommentExt } from '@/types/prismaExtensions';
import { databaseDateToPrettyDate, timestampToDate } from '@/utils/convertDate';

export default function PostBox({
  id,
  journalEntry,
  createdBy,
  createdAt,
  title,
  text,
  comments: cmts,
}: PostExt) {
  const { data: session } = useSession();
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [comments, setComments] = useState<CommentExt[]>(cmts);
  const [editingComment, setEditingComment] = useState<Comment>();
  const [editingCommentNewText, setEditingCommentNewText] =
    useState<string>('');

  async function handleSubmitNewComment() {
    // prompt the user to sign in if they're not already
    if (!session || !session.user) {
      signIn();
      return;
    }

    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        body: JSON.stringify({
          userId: session?.user.id,
          postId: id,
          text: newCommentText,
        }),
      });

      const postedComment = await res.json();
      if (!postedComment) throw new Error('postedComment is null');

      setComments((prevComments) => [...prevComments, postedComment]);
    } catch (error) {
      console.error('error submitting post comment: ' + error);
    }

    // Reset the comment input
    setNewCommentText('');
  }

  async function handleSubmitEditComment() {
    if (!session || !session.user) {
      signIn();
      return;
    }

    if (!editingComment) {
      console.log("trying to edit comment while it's null");
      return;
    }

    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        body: JSON.stringify({
          commentId: editingComment.id,
          userId: session?.user.id,
          postId: id,
          text: editingCommentNewText,
        }),
      });
      if (!res.ok) throw new Error(`API response status: ${res.status}`);

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === editingComment.id
            ? { ...comment, text: editingCommentNewText }
            : comment,
        ),
      );
    } catch (error) {
      console.log("error submitting post's edited comment: " + error);
    }

    stopEditingComment();
  }

  function stopEditingComment() {
    setEditingComment(undefined);
    setEditingCommentNewText('');
  }

  async function handleDeleteComment(comment: CommentExt) {
    try {
      const res = await fetch(`/api/comment?commentId=${comment.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`API response status: ${res.status}`);

      setComments((prevComments) =>
        prevComments.filter((com) => com.id !== comment.id),
      );
    } catch (error) {
      console.log('error deleting comment: ' + error);
    }
  }

  function blurElement(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.blur();
  }

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
        {session?.user && (
          <div className='my-4 flex gap-x-4 px-4'>
            <div className='w-14 flex-none'>
              <Image
                src={session.user.image}
                className='rounded-full'
                width={50}
                height={50}
                alt={`${session.user.name}'s avatar`}
              />
            </div>
            <div className='flex w-full flex-col gap-y-2 sm:mr-8'>
              <textarea
                name='comment'
                id='comment'
                className='p-1 placeholder:italic'
                placeholder='Add a comment...'
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                aria-label='Comment Input'
              ></textarea>
              <div className='flex justify-end'>
                <button
                  className='btn bg-transparent'
                  onClick={handleSubmitNewComment}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        )}
        <div className='divider'>Comments</div>
        <div className='mb-24 mt-12 flex flex-col gap-y-8 px-4'>
          {comments.map((comment, index) => {
            return (
              <div
                className='flex gap-x-1 sm:gap-x-4'
                key={`comment-${index}`}
                aria-label='User comment'
              >
                <div className='w-14 flex-none'>
                  {comment.user && comment.user.image && (
                    <Image
                      src={comment.user.image}
                      className='rounded-full'
                      width={50}
                      height={50}
                      alt={`${comment.user.name}'s avatar`}
                    />
                  )}
                </div>
                <div className='flex w-full flex-col'>
                  <p>{comment.user && comment.user.name}</p>
                  {editingComment && editingComment.id === comment.id && (
                    <div className='flex flex-col gap-y-2'>
                      <textarea
                        name='editingComment'
                        id='editingComment'
                        className='w-full p-1 placeholder:italic'
                        value={editingCommentNewText}
                        onChange={(e) =>
                          setEditingCommentNewText(e.target.value)
                        }
                        aria-label='Edit Comment Input'
                      ></textarea>
                      <div className='flex justify-end'>
                        <button
                          className='btn bg-transparent p-3'
                          onClick={handleSubmitEditComment}
                        >
                          Submit
                        </button>
                        <button
                          className='btn bg-transparent p-3'
                          onClick={stopEditingComment}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {(!editingComment || editingComment.id !== comment.id) && (
                    <p>{comment.text}</p>
                  )}
                </div>
                <div className='flex-none'>
                  {comment.userId === session?.user.id && (
                    <div className='dropdown dropdown-end'>
                      <label
                        tabIndex={0}
                        className='btn bg-transparent p-0'
                        aria-label='Open menu'
                        aria-haspopup='true'
                      >
                        <Image
                          src='/images/kebab_icon.svg'
                          className='invert'
                          width={30}
                          height={30}
                          alt='menu icon'
                        />
                      </label>
                      <ul
                        tabIndex={0}
                        className='dropdown-content menu rounded-box w-fit bg-base-100 p-2 shadow'
                      >
                        <li>
                          <button
                            onClick={(e) => {
                              setEditingComment(comment);
                              setEditingCommentNewText(comment.text);
                              blurElement(e);
                            }}
                          >
                            Edit
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={(e) => {
                              handleDeleteComment(comment);
                              blurElement(e);
                            }}
                          >
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </details>
  );
}
