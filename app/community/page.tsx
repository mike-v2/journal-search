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
      <Head>
        <title>Harry&apos;s Journals</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
      </Head>
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