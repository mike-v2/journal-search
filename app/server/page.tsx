import prisma from '@/utils/prisma';
import JournalEntryBox from '@/components/journalEntryBox';

async function getJournalEntriesForYear(yearString: string) {
  try {
    const year = Number(yearString);
    const startDate = new Date(Date.UTC(year, 0, 1));

    const entries = await prisma.journalEntry.findMany({
      where: {
        date: {
          gte: startDate,
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
      include: {
        starredBy: true,
        readBy: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return entries;
  } catch (error) {
    console.error(error);
  }
}

export default async function Browse() {
  const journalEntries = await getJournalEntriesForYear('1944');

  return (
    <main className='min-h-screen'>
      <div className='grid grid-cols-2 gap-6'>
        {journalEntries &&
          journalEntries
            .slice(0, 4)
            .map((entry) => <JournalEntryBox key={entry.id} {...entry} />)}
      </div>
    </main>
  );
}
