import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Josefin_Sans, Playball, Libre_Baskerville, Arvo} from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import CreateData from '@/components/createData'
import { JournalEntry } from '@prisma/client'
import { journalDateToISOString } from '@/utils/convertDate'
import JournalEntryBox from '@/components/journalEntryBox'

const inter = Inter({ subsets: ['latin'] })

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500'],
});

const playball = Playball({
  subsets: ['latin'],
  weight: ['400'],
})

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400'],
})

const arvo = Arvo({
  subsets: ['latin'],
  weight: ['400'],
})

const bioText = {
  header: "Welcome to the Harry Howard Journals:",
  subheader: "A Glimpse into the 1930s Life of a Salt Lake City Family Man",
  body: "Discover the fascinating world of Harry Howard (1899-1959), a devoted husband, father, and proud resident of Salt Lake City. Through the pages of his personal journals, we invite you to journey back in time and gain insight into the life and experiences of a family man in the 1930s.\n\nHarry worked tirelessly at the post office, ensuring the smooth flow of communication within his community. He was married to the love of his life, Grace, with whom he built a beautiful family. Together, they raised seven children: Cathy, Charles, Sonny, Sharon, Ardie, Dorothy and Betty.\n\nHarry was a deeply spiritual man, actively involved in the Latter-Day Saints (LDS) church. His faith and commitment to his community played a significant role in shaping his daily life.\n\nAs you explore this site, take a moment to immerse yourself in Harry's world. Delve into his thoughts, hopes, and dreams, and witness the unfolding of a rich and vibrant family history that has been lovingly preserved for future generations.\n\nWelcome to the Harry Howard Journals – your portal to the past."
}

interface ExampleTopic {
  header: string,
  entryDate: string,
  entry?: JournalEntry,
  imagePath: string,
}

export default function Home() {
  const [exampleTopics, setExampleTopics] = useState<ExampleTopic[]>([
    {
      header: 'Grace Howard',
      entryDate: '06-24-1948',
      imagePath: '/images/Harry-Grace-1.png'
    },
    {
      header: 'Ardie Howard',
      entryDate: '06-05-1948',
      imagePath: '/images/Ardie-1.png'
    },
    {
      header: 'Charles, Sonny, and Sharon Howard',
      entryDate: '03-04-1948',
      imagePath: '/images/Grace-Sharon-Sonny-Charles.png',
    }
  ]);

  useEffect(() => {
    async function fetchJournalEntryByDate(journalDate: string): Promise<JournalEntry | undefined> {
      const dateISO = journalDateToISOString(journalDate);

      try {
        const res = await fetch(`/api/journalEntry?date=${dateISO}`, {
          method: 'GET',
        });

        if (res.status === 200) {
          const entry = await res.json() as JournalEntry;
          if (entry) {
            return entry;
          }
        } else if (res.status === 500) {
          const data = await res.json();
          console.log(data.error);
        } else {
          console.log("Could not find journal entry by date");
        }
      } catch (error) {
        console.log("Could not find journal entry by date: " + error);
      }

      return undefined;
    }

    async function updateTopics() {
      const newState = [...exampleTopics];
      const promises = newState.map((topic, index) =>
        fetchJournalEntryByDate(topic.entryDate)
          .then(entry => {
            newState[index].entry = entry;
          })
      );

      await Promise.all(promises);
      setExampleTopics(newState);
    }

    updateTopics();
  }, []);

  return (
    <>
      <Head>
        <title>Journal Search</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className='flex flex-col md:flex-row mt-10 max-w-7xl mx-auto h-fit'>
          <div className='mx-auto basis-full flex justify-center'>
            <Image src='/images/Harry-1.png' className='object-contain' width={600} height={800} alt='picture of Harry Howard' />
          </div>
          <div className='flex flex-col justify-center text-center whitespace-pre-line basis-full'>
            <h3 className={`${playball.className} p-5 text-4xl text-slate-200`}>
              {bioText.header}
            </h3>
            <h3 className={`${josefin.className} p-5 pt-0 text-xl text-slate-200`}>
              {bioText.subheader}
            </h3>
            <div className={`${josefin.className} p-5 `}>
              {bioText.body}
            </div>
          </div>
        </div>

        {exampleTopics && exampleTopics.map((topic, index) => {
          return (
            <div className={`flex flex-col-reverse ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} mt-10 max-w-7xl mx-auto h-fit`} key={topic.header}>
              <div className=' whitespace-pre-line w-full md:w-1/2 my-auto'>
                <h3 className={`${playball.className} text-center text-4xl text-slate-200 p-5`}>
                  {topic.header}
                </h3>
                <div className={`p-5 pt-0`}>
                  {topic.entry && <JournalEntryBox {...topic.entry} />}
                </div>
              </div>
              <div className='mx-auto w-full md:w-1/2 flex justify-center'>
                <Image src={`${topic.imagePath}`} className='object-contain' width={600} height={800} alt={`picture of ${topic.header}`} />
              </div>
            </div>
          )
        })}
      </main>
    </>
  )
}
