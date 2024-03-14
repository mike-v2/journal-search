import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/utils/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateString = searchParams.get('date');
  const dateArray = searchParams.getAll('date[]');
  const yearString = searchParams.get('year');

  if (dateString) {
    //get journal entry on specific date
    try {
      const parsedDate = new Date(dateString);
      const utcDate = new Date(
        Date.UTC(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate(),
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

      return NextResponse.json(entry);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  } else if (dateArray && dateArray.length > 0) {
    //get journal entries for an array of dates
    const dates = dateArray.map((dateString) => {
      const d = new Date(dateString);
      return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    });
    try {
      const entries = await prisma.journalEntry.findMany({
        where: {
          date: {
            in: dates,
          },
        },
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
  } else if (yearString) {
    // get journal entries for specific year
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
