'use client';

import { useState } from 'react';
import Image from 'next/image';

import { signIn, useSession } from 'next-auth/react';

import { CommentExt } from '@/types/prismaExtensions';
import { withAxiosTryCatch } from '@/utils/withAxiosTryCatch';
import {
  deleteComment,
  saveComment,
} from '@/app/apiRequests/clientApiRequests';

export default function Comments({
  comments: cmts,
  postId,
}: {
  comments: CommentExt[];
  postId: string;
}) {
  const { data: session } = useSession();
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [editingComment, setEditingComment] = useState<CommentExt | null>(null);
  const [editingCommentNewText, setEditingCommentNewText] =
    useState<string>('');
  const [comments, setComments] = useState<CommentExt[]>(cmts);

  async function handleSubmitNewComment() {
    // prompt the user to sign in if they're not already
    if (!session || !session.user) {
      signIn();
      return;
    }

    const { data: newComment, error } = await withAxiosTryCatch(
      saveComment({
        userId: session?.user.id,
        postId,
        text: newCommentText,
      }),
    );

    if (!!error) throw new Error(error);
    if (newComment) {
      setComments((prevComments) => [...prevComments, newComment]);
    }

    // Reset the comment input
    setNewCommentText('');
  }

  async function handleSubmitEditComment() {
    if (!editingComment) return;

    const { data: edComment, error } = await withAxiosTryCatch(
      saveComment({
        id: editingComment.id,
        userId: session?.user.id,
        postId,
        text: editingCommentNewText,
      }),
    );

    if (!!error) throw new Error(error);

    if (edComment) {
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === editingComment.id
            ? { ...comment, text: editingCommentNewText }
            : comment,
        ),
      );
    }

    stopEditingComment();
  }

  function stopEditingComment() {
    setEditingComment(null);
    setEditingCommentNewText('');
  }

  async function handleDeleteComment(id: string) {
    const { data: message, error } = await withAxiosTryCatch(deleteComment(id));

    if (!!error) throw new Error(error);

    console.log('deleted comment? ', message);

    setComments((prevComments) => prevComments.filter((com) => com.id !== id));
  }

  function blurElement(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.blur();
  }

  return (
    <>
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
                      onChange={(e) => setEditingCommentNewText(e.target.value)}
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
                            handleDeleteComment(comment.id);
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
    </>
  );
}
