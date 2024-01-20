import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/utils/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const year = searchParams.get('year');

  if (date) {
    //get journal entry on specific date
    try {
      const parsedDate = new Date(date as string);
      const entry = await prisma.journalEntry.findUnique({
        where: { date: parsedDate },
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

      return NextResponse.json(entry);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  } else if (year) {
    // get journal entries for specific year
    try {
      const parsedYear = parseInt(year as string);
      const startDate = new Date(Date.UTC(parsedYear, 0, 1));

      const entries = await prisma.journalEntry.findMany({
        where: {
          date: {
            gte: startDate,
            lt: new Date(parsedYear + 1, 0, 1),
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

      return NextResponse.json(entries);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  } else {
    //get all journal entries
    try {
      const entries = await prisma.journalEntry.findMany({
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

      return NextResponse.json(entries);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
