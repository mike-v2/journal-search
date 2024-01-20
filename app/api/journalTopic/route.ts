import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/utils/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const journalEntryId = searchParams.get('journalEntryId');

  if (journalEntryId) {
    //get topics for journal entry
    try {
      const topics = await prisma.journalTopic.findMany({
        where: {
          journalEntryId: journalEntryId as string,
        },
      });

      return NextResponse.json(topics);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
