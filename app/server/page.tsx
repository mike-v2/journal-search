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

async function getJournalEntryOnDay(dateString: string) {
  try {
    const parsedDate = new Date(dateString);
    const utcDate = new Date(
      Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate(),
      ),
    );

    const entry = await prisma.journalEntry.findUnique({
      where: { date: utcDate },
      select: {
        id: true,
        content: true,
        date: true,
        starredBy: true,
        readBy: true,
        startPage: true,
        endPage: true,
      },
    });

    return entry;
  } catch (error) {
    console.error(error);
  }
}

export default async function Browse() {
  const journalEntry = await getJournalEntryOnDay('1-1-1944');

  return (
    <main className='min-h-screen'>
      <div className='grid grid-cols-2 gap-6'>
        {journalEntry && (
          <JournalEntryBox key={journalEntry.id} {...journalEntry} />
        )}
      </div>
    </main>
  );
}
