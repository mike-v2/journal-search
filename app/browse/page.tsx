import { withAxiosTryCatch } from '@/utils/withAxiosTryCatch';
import { getJournalEntriesForYear } from '@/app/apiRequests/serverApiRequests';

import DateSlider from '@/app/browse/components/slider';
import DisplayEntries from '@/app/browse/components/displayEntries';
import YearSelector from '@/app/browse/components/yearSelector';

export default async function Browse({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const year = searchParams['year'];

  const { data: journalEntries } = await withAxiosTryCatch(
    getJournalEntriesForYear(year as string),
  );

  return (
    <main className='min-h-screen'>
      <section>
        <YearSelector />
        {journalEntries && <DateSlider journalEntries={journalEntries} />}
      </section>

      {journalEntries && <DisplayEntries journalEntries={journalEntries} />}
    </main>
  );
}
