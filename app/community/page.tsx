'use client';

import { useEffect, useState } from "react"
import PostBox from "@/components/postBox";
import Head from "next/head";
import PostExt from "@/types/postExt";

export default function Community() {
  const [posts, setPosts] = useState<PostExt[]>();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/post', {
          method: 'GET',
        })
        const data = await res.json();

        setPosts(data as PostExt[]);
      } catch (error) {
        console.log("could not fetch posts: " + error);
      }
    }

    fetchPosts();
  }, []);

  return (
    <>
      <main className="min-h-screen mt-20 pb-20">
        <div className={`w-full max-w-4xl mx-auto md:px-12`}>
          {posts && posts.map(post => {
            return (
              <div className="border-4 rounded-2xl" key={post.id}>
                <PostBox {...post} />
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}