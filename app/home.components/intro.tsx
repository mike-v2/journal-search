import Image from 'next/image';

const bioText = {
  header: 'Welcome to the Harry Howard Journals:',
  subheader: 'A Glimpse into the 1930s Life of a Salt Lake City Family Man',
  body: "Discover the fascinating world of Harry Howard (1899-1959), a devoted husband, father, and proud resident of Salt Lake City. Through the pages of his personal journals, we invite you to journey back in time and gain insight into the life and experiences of a family man in the 1930s.\n\nHarry worked tirelessly at the post office, ensuring the smooth flow of communication within his community. He was married to the love of his life, Grace, with whom he built a beautiful family. Together, they raised seven children: Cathy, Charles, Sonny, Sharon, Ardie, Dorothy and Betty.\n\nHarry was a deeply spiritual man, actively involved in the Latter-Day Saints (LDS) church. His faith and commitment to his community played a significant role in shaping his daily life.\n\nAs you explore this site, take a moment to immerse yourself in Harry's world. Delve into his thoughts, hopes, and dreams, and witness the unfolding of a rich and vibrant family history that has been lovingly preserved for future generations.\n\nWelcome to the Harry Howard Journals – your portal to the past.",
};

export function Intro() {
  return (
    <>
      <section className='relative flex h-fit flex-col border-b-4 border-b-amber-200 md:flex-row'>
        <div className='banner absolute inset-0 opacity-20'></div>
        <div className='relative z-0 mx-auto w-full max-w-3xl'>
          <Image
            className='h-auto w-full'
            src='/images/harry-banner.png'
            width={0}
            height={0}
            sizes='100vw'
            alt='Welcome banner'
          />
          <div className='absolute -bottom-20 left-0 h-40 w-40 sm:h-60 sm:w-60 lg:-left-40 lg:h-80 lg:w-80'>
            <Image
              className='h-auto w-full'
              src='/images/books-1.png'
              width={0}
              height={0}
              sizes='100vw'
              alt='stack of books'
            />
          </div>
          <div className='absolute -bottom-20 right-0 h-40 w-40 sm:h-60 sm:w-60 lg:-right-40 lg:h-80 lg:w-80'>
            <Image
              className='h-auto w-full'
              src='/images/books-2.png'
              width={0}
              height={0}
              sizes='100vw'
              alt='stack of books'
            />
          </div>
        </div>
      </section>

      <section>
        <article className='relative z-0 mx-auto max-w-3xl basis-full whitespace-pre-line px-4 pt-24'>
          <p>{bioText.body}</p>

          <div className='absolute bottom-0 right-0 -z-10 h-[40rem] w-[40rem]'>
            <Image
              src='/images/quill.png'
              className='h-auto w-full opacity-30'
              width={0}
              height={0}
              sizes='100vw'
              alt='quill'
            />
          </div>
        </article>
      </section>
    </>
  );
}
