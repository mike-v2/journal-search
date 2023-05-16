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

const highlightGraceEntryDate = '06-24-1948';
const highlightArdieEntryDate = '06-05-1948';
const highlightCharlesEntryDate = '03-04-1948';

export default function Home() {
  const [highlightGraceEntry, setHighlightGraceEntry] = useState<JournalEntry>();
  const [highlightArdieEntry, setHighlightArdieEntry] = useState<JournalEntry>();
  const [highlightCharlesEntry, setHighlightCharlesEntry] = useState<JournalEntry>();

  useEffect(() => {
    fetchJournalEntryByDate(highlightGraceEntryDate).then(entry => setHighlightGraceEntry(entry));
    fetchJournalEntryByDate(highlightArdieEntryDate).then(entry => setHighlightArdieEntry(entry));
    fetchJournalEntryByDate(highlightCharlesEntryDate).then(entry => setHighlightCharlesEntry(entry));
  }, []);

  async function fetchJournalEntryByDate(journalDate: string) : Promise<JournalEntry | undefined> {

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

  return (
    <>
      <Head>
        <title>Journal Search</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className='flex flex-col md:flex-row mt-10 max-w-7xl mx-auto h-fit'>
          <div className='mx-auto w-full md:w-1/2 flex justify-center'>
            <Image src='/images/Harry-1.png' className='object-contain' width={600} height={800} alt='picture of Harry Howard' />
          </div>
          <div className='text-center whitespace-pre-line w-full md:w-1/2'>
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

        <div className='flex flex-col-reverse md:flex-row mt-10 max-w-7xl mx-auto h-fit'>
          <div className='text-center whitespace-pre-line w-full md:w-1/2 my-auto'>
            <h3 className={`${playball.className} p-5 text-4xl text-slate-200`}>
              Grace Howard
            </h3>
            <h3 className={`${josefin.className} p-5 pt-0 text-xl text-slate-200`}>
              {highlightGraceEntry && <JournalEntryBox {...highlightGraceEntry} />}
            </h3>
          </div>
          <div className='mx-auto w-full md:w-1/2 flex justify-center'>
            <Image src='/images/Harry-Grace-1.png' className='object-contain' width={600} height={800} alt='picture of Harry and Grace Howard' />
          </div>
        </div>

        <div className='flex flex-col md:flex-row mt-10 max-w-7xl mx-auto h-fit'>
          <div className='mx-auto w-full md:w-1/2 flex justify-center'>
            <Image src='/images/Ardie-1.png' className='object-contain' width={600} height={800} alt='picture of Ardie Howard' />
          </div>
          <div className='text-center whitespace-pre-line w-full md:w-1/2 my-auto'>
            <h3 className={`${playball.className} p-5 text-4xl text-slate-200`}>
              Ardis (Ardie) Howard
            </h3>
            <h3 className={`${josefin.className} p-5 pt-0 text-xl text-slate-200`}>
              {highlightArdieEntry && <JournalEntryBox {...highlightArdieEntry} />}

            </h3>
          </div>
        </div>

        <div className='flex flex-col-reverse md:flex-row mt-10 max-w-7xl mx-auto h-fit'>
          <div className='text-center whitespace-pre-line w-full md:w-1/2 my-auto'>
            <h3 className={`${playball.className} p-5 text-4xl text-slate-200`}>
              Charles, Sonny, and Sharon Howard
            </h3>
            <h3 className={`${josefin.className} p-5 pt-0 text-xl text-slate-200`}>
              {highlightCharlesEntry && <JournalEntryBox {...highlightCharlesEntry} />}
            </h3>
          </div>
          <div className='mx-auto w-full md:w-1/2 flex justify-center'>
            <Image src='/images/Grace-Sharon-Sonny-Charles.png' className='object-contain' width={600} height={800} alt='picture of Charles, Sonny, and Sharon Howard' />
          </div>
        </div>
      </main>
    </>
  )
}
