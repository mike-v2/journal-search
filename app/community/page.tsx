import { withAxiosTryCatch } from '@/utils/withAxiosTryCatch';
import { getCommunityPosts } from '@/app/apiRequests/serverApiRequests';

import PostBox from '@/app/community/components/postBox';

export default async function Community() {
  const { data: posts } = await withAxiosTryCatch(getCommunityPosts());

  return (
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
  );
}
