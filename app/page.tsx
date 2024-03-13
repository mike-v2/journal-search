import dynamic from 'next/dynamic';

import { withAxiosTryCatch } from '@/utils/withAxiosTryCatch';
import { getJournalEntries } from '@/app/apiRequests/serverApiRequests';

import { Photos, Chat, Entries, Intro } from '@/app/home.components';

const carouselEntries = [
  '06-24-1948',
  '12-27-1944',
  '12-28-1945',
  '12-06-1944',
  '08-24-1945',
  '11-07-1945',
  '6-10-1944',
  '09-19-1948',
  '04-16-1948',
];

export default async function Home() {
  const { data: journalEntries } = await withAxiosTryCatch(
    getJournalEntries(carouselEntries),
  );
  console.log('journalEntries: ', journalEntries);

  return (
    <main>
      <Intro />

      <Photos />

      <Chat />

      {journalEntries && <Entries journalEntries={journalEntries} />}
    </main>
  );
}
