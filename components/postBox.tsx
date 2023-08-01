import JournalEntryBox from "@/components/journalEntryBox";
import { useState } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { Comment } from "@prisma/client";
import PostExt from "@/types/postExt";
import CommentExt from '@/types/commentExt'
import { makeDatePretty, timestampToDate } from "@/utils/convertDate";

export default function PostBox({ id, journalEntry, createdBy, createdAt, title, text, comments: cmts }: PostExt) {
  const { data: session } = useSession();
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [comments, setComments] = useState<CommentExt[]>(cmts);
  const [editingComment, setEditingComment] = useState<Comment>();
  const [editingCommentNewText, setEditingCommentNewText] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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
        })
      });

      const postedComment = await res.json();
      if (!postedComment) throw new Error('postedComment is null');

      setComments(prevComments => [...prevComments, postedComment]);
    } catch (error) {
      console.error("error submitting post comment: " + error); 
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
      console.log("trying to edit comment while it's null")
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
        })
      });

      const postedComment = await res.json();
      postedComment["user"] = session?.user;

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === editingComment.id ? { ...comment, text: editingCommentNewText } : comment
        )
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
      })

      if (res.status === 200) {
        setComments(prevComments => prevComments.filter(com => com.id !== comment.id));
      }
    } catch (error) {
      console.log("error deleting comment: " + error);
    }
  }

  function blurElement(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.blur();
  }

  return (
    <div className="collapse" aria-label="User post">
      <summary className="collapse-title rounded-xl list-none text-white hover:text-black hover:bg-amber-300" onClick={e => setIsExpanded(prevExpanded => !prevExpanded)}>
        <div className="flex flex-col sm:flex-row gap-x-6 gap-y-4">
          <div className="text-xl font-medium mx-auto sm:mx-0">
            <p>{makeDatePretty(timestampToDate(new Date(journalEntry.date).toISOString()))}</p>
            <p>{title.slice(0, 150)}</p>
          </div>
          <div className="mx-auto sm:mx-0 sm:ms-auto">
            <div className="flex gap-x-2">
              {createdBy.image &&
                <Image src={createdBy.image} className="rounded-full" width={50} height={50} alt={`${createdBy.name}'s avatar`} />
              }
              <div className="flex flex-col justify-center">
                <p className="inline">{createdBy.name}</p>
                <p className="text-sm italic">{timestampToDate(new Date(createdAt).toISOString())}</p>
              </div>
            </div>

          </div>
        </div>
      </summary>
      {isExpanded &&
        <article className="flex flex-col mx-auto" key={id} aria-label="posted journal entry">
          <JournalEntryBox {...journalEntry} />
          <div className="mt-8 mb-16 px-4">
            <p>
              {text}
            </p>
          </div>
          {session?.user &&
            <div className="flex my-4 px-4">
              <div className="w-14">
                <Image src={session.user.image} className="rounded-full" width={50} height={50} alt={`${session.user.name}'s avatar`} />
              </div>
              <div className="flex flex-col w-11/12">
                <textarea
                  name="comment"
                  id="comment"
                  className="ml-4 placeholder:italic"
                  placeholder="Add a comment..."
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  aria-label="Comment Input"
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button className="btn bg-transparent" onClick={handleSubmitNewComment}>
                    Comment
                  </button>
                </div>
              </div>
            </div>
          }
          <div className="divider">Comments</div>
          <div className="flex flex-col gap-y-8 mt-12 mb-24 px-4">
            {comments.map((comment, index) => {
              return (
                <div className="flex" key={`comment-${index}`} aria-label="User comment">
                  <div className="w-14">
                    {comment.user && comment.user.image &&
                      <Image src={comment.user.image} className="rounded-full" width={50} height={50} alt={`${comment.user.name}'s avatar`} />
                    }
                  </div>
                  <div className="flex-1 flex flex-col ml-4 pr-4">
                    <p>
                      {comment.user && comment.user.name}
                    </p>
                    {editingComment && editingComment.id === comment.id &&
                      <div className="flex flex-col w-11/12">
                        <textarea
                          name="editingComment"
                          id="editingComment"
                          className="ml-4 placeholder:italic"
                          value={editingCommentNewText}
                          onChange={e => setEditingCommentNewText(e.target.value)}
                          aria-label="Edit Comment Input"
                        ></textarea>
                        <div className="flex justify-end mt-2">
                          <button className="btn bg-transparent" onClick={handleSubmitEditComment}>
                            Submit
                          </button>
                          <button className="btn bg-transparent" onClick={stopEditingComment}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    }
                    {(!editingComment || editingComment.id !== comment.id) &&
                      <p>
                        {comment.text}
                      </p>
                    }
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
                              setEditingComment(comment);
                              setEditingCommentNewText(comment.text);
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
          </div>

        </article>
      }
    </div>
  )
}