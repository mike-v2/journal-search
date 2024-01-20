import { NextRequest } from 'next/server';

import prisma from '@/utils/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const journalEntryId = searchParams.get('journalEntryId');

  if (userId && journalEntryId) {
    //check if user has read entry
    try {
      const readEntry = await prisma.readEntry.findFirst({
        where: {
          userId: userId as string,
          journalEntryId: journalEntryId as string,
        },
      });

      //use 'currentIsRead' to avoid naming conflicts in receiving component
      return Response.json({ currentIsRead: !!readEntry });
    } catch (error) {
      console.error(error);
      return Response.json({ error }, { status: 500 });
    }
  } else if (userId) {
    //get all entries read by user
    try {
      const readEntries = await prisma.readEntry.findMany({
        where: {
          userId: userId as string,
        },
        include: {
          journalEntry: true,
        },
      });

      return Response.json(readEntries);
    } catch (error) {
      console.error(error);
      return Response.json({ error }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  //user has toggled read entry
  const { userId, journalEntryId, isRead } = await req.json();

  if (!userId || !journalEntryId || !isRead) {
    return Response.json(
      {
        error:
          'userId, journalEntryId, and isRead are required to change a readEntry',
      },
      { status: 404 },
    );
  }

  try {
    if (isRead) {
      await prisma.readEntry.delete({
        where: {
          userId_journalEntryId: {
            userId: userId as string,
            journalEntryId: journalEntryId as string,
          },
        },
      });

      //use 'currentIsRead' to avoid naming conflicts in receiving component
      return Response.json({ currentIsRead: false });
    } else {
      const readEntry = await prisma.readEntry.create({
        data: {
          userId: userId as string,
          journalEntryId: journalEntryId as string,
        },
      });

      return Response.json({ currentIsRead: !!readEntry });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
