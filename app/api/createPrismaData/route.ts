import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    /* const newEntries = await prisma.journalEntry.createMany({
        data: data,
        skipDuplicates: true,
      }); */
    /* const newEntry = await prisma.journalEntry.create({
        data: data,
      }); */
    const newTopic = await prisma.journalTopic.create({
      data: data,
    });
    /* const newTopic = await prisma.journalTopic.updateMany({
        where: {
          id: data.id,
        },
        data: {
          date: data.date,
        },
      }); */

    return NextResponse.json(newTopic);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
