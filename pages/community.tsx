import JournalEntryBox from "@/components/journalEntryBox";
import { Comment, JournalEntry, Post, User } from "@prisma/client";
import { useSession } from "next-auth/react"; 
import { useEffect, useState } from "react"
import PostBox from "./postBox";

interface PostExt extends Post {
  journalEntry: JournalEntry,
  createdBy: User,
  comments: Comment[],
}

export default function Community() {
  const [posts, setPosts] = useState<PostExt[]>();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/post', {
          method: 'GET',
        })
        const data = await res.json();

        setPosts(data);
      } catch (error) {
        console.log("could not fetch posts: " + error);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className={`flex mt-20 border-4 rounded-2xl w-fit p-10`}>
      {posts && posts.map(post => {
        return (
          <div key={post.id}>
            <PostBox {...post} />
          </div>
        )
      })}
    </div>
  )
}