'use client';

import { useEffect, useState } from 'react';

import { PostExt } from '@/types/prismaExtensions';

import PostBox from '@/app/community/components/postBox';

export default function Community() {
  const [posts, setPosts] = useState<PostExt[]>();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/communityPost', {
          method: 'GET',
        });
        const data = await res.json();

        setPosts(data as PostExt[]);
      } catch (error) {
        console.log('could not fetch posts: ' + error);
      }
    }

    fetchPosts();
  }, []);

  return (
    <>
      <main className='mt-20 min-h-screen pb-20'>
        <div className={`mx-auto w-full max-w-4xl md:px-12`}>
          {posts &&
            posts.map((post) => {
              return (
                <div className='rounded-2xl border-4' key={post.id}>
                  <PostBox {...post} />
                </div>
              );
            })}
        </div>
      </main>
    </>
  );
}
