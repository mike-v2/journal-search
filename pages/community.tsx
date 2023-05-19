import JournalEntryBox from "@/components/journalEntryBox";
import { JournalEntry, Post, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"

interface PostExt extends Post {
  journalEntry: JournalEntry,
  createdBy: User,
}
export default function Community() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<PostExt[]>();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/post', {
          method: 'GET',
        })
        const data = await res.json();

        console.log("posts sample::")
        console.log(data[0]);
        setPosts(data);
      } catch (error) {
        console.log("could not fetch posts: " + error);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="flex mt-20 border-4 rounded-2xl w-fit p-10">
      {posts && posts.map(post => {
        return (
          <div className="flex flex-col mx-auto" key={post.id}>
            <JournalEntryBox {...post.journalEntry} />
            <div>
              Author: {post.createdBy.name}
            </div>
            <div>
              {post.text}
            </div>
          </div>
        )
      })}
    </div>
  )
}