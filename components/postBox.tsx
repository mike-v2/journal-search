import JournalEntryBox from "@/components/journalEntryBox";
import { useEffect, useState } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { JournalEntry, Post, User, Comment } from "@prisma/client";

interface PostExt extends Post {
  journalEntry: JournalEntry,
  createdBy: User,
  comments: Comment[],
}

interface CommentExt extends Comment {
  user: User,
}

export default function PostBox({id, journalEntry, createdBy, text, comments} : PostExt) {
  const { data: session } = useSession();
  const [commentText, setCommentText] = useState<string>('');
  const [updatedComments, setUpdatedComments] = useState<Comment[]>(comments);

  async function handleSubmitComment() {
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
          text: commentText,
        })
      });

      const postedComment = await res.json();
      postedComment["user"] = session?.user;
      
      setUpdatedComments(prevComments => [...prevComments, postedComment]);
    } catch (error) {
      console.log("error submitting post comment: " + error);
    }

    setCommentText('');
  }

  function handleEditComment(comment: CommentExt) {

  }

  async function handleDeleteComment(comment: CommentExt) {
    try {
      const res = await fetch(`/api/comment?commentId=${comment.id}`, {
        method: 'DELETE',
      })

      if (res.status === 200) {
        setUpdatedComments(prevComments => prevComments.filter(com => com.id !== comment.id));
      }
    } catch(error) {
      console.log("error deleting comment: " + error);
    }
  }

  function blurElement(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.blur();
  }

  return (
    <article className="flex flex-col mx-auto" key={id} aria-label="posted journal entry">
      <JournalEntryBox {...journalEntry} />
      <div aria-label="User post" className="flex mt-6">
        {createdBy.image &&
          <Image src={createdBy.image} className="rounded-full" width={50} height={50} alt={`${createdBy.name}'s avatar`} />
        }
        <div className="flex flex-col ml-4">
          <p className="font-bold">
            {createdBy.name}
          </p>
          <p>
            {text}
          </p>
        </div>
      </div>
      <div className="flex my-4">
        <div className="w-14">
          {session?.user &&
            <Image src={session.user.image} className="rounded-full" width={50} height={50} alt={`${session.user.name}'s avatar`} />
          }
        </div>
        <div className="flex flex-col w-11/12">
          <textarea
            name="comment"
            id="comment"
            className="ml-4 placeholder:italic"
            placeholder="Add a comment..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            aria-label="Comment Input"
          ></textarea>
          <div className="flex justify-end mt-2">
            <button className="btn bg-transparent" onClick={handleSubmitComment}>
              Comment
            </button>
          </div>
        </div>
      </div>
      <div className="divider">Comments</div>
      {(updatedComments as CommentExt[]).map((comment, index) => {
        return (
          <div className="flex mt-8" key={`comment-${index}`} aria-label="User comment">
            <div className="w-14">
              {comment.user && comment.user.image &&
                <Image src={comment.user.image} className="rounded-full" width={50} height={50} alt={`${comment.user.name}'s avatar`} />
              }
            </div>
            <div className="flex-1 flex flex-col ml-4 pr-4">
              <p>
                {comment.user && comment.user.name}
              </p>
              <p>
                {comment.text}
              </p>
            </div>
            <div className="flex justify-end ml-auto w-12">
              {comment.userId === session?.user.id &&
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn bg-transparent p-0" aria-label="Open menu" aria-haspopup="true">
                    <Image src='/images/kebab_icon.svg' className="invert" width={30} height={30} alt='menu icon' />
                  </label>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-fit">
                    <li><button
                      onClick={e => {
                        handleEditComment(comment);
                        blurElement(e);
                      }}>Edit</button></li>
                    <li><button
                      onClick={e => {
                        handleDeleteComment(comment);
                        blurElement(e);
                      }}>Delete</button></li>
                  </ul>
                </div>
              }
            </div>
          </div>
        )
      })}
    </article>
  )
}