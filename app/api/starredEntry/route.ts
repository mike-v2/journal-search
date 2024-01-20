import { StarredEntryExt } from '@/types/prismaExtensions';
import prisma from '@/utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const journalEntryId = searchParams.get('journalEntryId');

  if (userId && journalEntryId) {
    //check if user has starred entry
    try {
      const starredEntry = await prisma.starredEntry.findFirst({
        where: {
          userId: userId as string,
          journalEntryId: journalEntryId as string,
        },
      });

      //use 'currentIsStarred' to avoid naming conflicts in receiving component
      return NextResponse.json({ currentIsStarred: !!starredEntry });
    } catch (error) {
      console.error('Error checking if user starred entry:', error);
      return NextResponse.json({ error }, {status: 500});
    }
  } else if (userId) {
    //get all entries starred by users
    try {
      const starredEntries: StarredEntryExt[] =
        await prisma.starredEntry.findMany({
          where: {
            userId: userId as string,
          },
          include: {
            journalEntry: true,
          },
        });

      starredEntries.sort(
        (a, b) =>
          new Date(a.journalEntry.date).getTime() -
          new Date(b.journalEntry.date).getTime(),
      );

      return NextResponse.json(starredEntries);
    } catch (error) {
      console.error("Error finding user's starred entries: ", error);
      return NextResponse.json({ error }, {status: 500});
    }
  }
}

export async function POST(req: NextRequest) {
  //user has starred entry
  const { userId, journalEntryId, isStarred } = await req.json();

  try {
    if (isStarred) {
      await prisma.starredEntry.delete({
        where: {
          userId_journalEntryId: {
            userId: userId as string,
            journalEntryId: journalEntryId as string,
          },
        },
      });

      //use 'currentIsStarred' to avoid naming conflicts in receiving component
      return NextResponse.json({ currentIsStarred: false });
    } else {
      const starredEntry = await prisma.starredEntry.create({
        data: {
          userId: userId as string,
          journalEntryId: journalEntryId as string,
        },
      });

      return NextResponse.json({ currentIsStarred: !!starredEntry });
    }
  } catch (error) {
    console.error('Error creating starred entry:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
