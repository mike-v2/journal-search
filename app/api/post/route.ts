import { NextRequest } from 'next/server';

import prisma from '@/utils/prisma';

export async function GET(req: NextRequest) {
  //get all posts
  try {
    const posts = await prisma.post.findMany({
      select: {
        journalEntry: true,
        createdBy: true,
        createdAt: true,
        title: true,
        text: true,
        comments: {
          include: {
            user: true,
            post: true,
          },
        },
        id: true,
      },
    });

    return Response.json(posts);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, journalEntryId, title, text } = await req.json();

  if (!userId || !journalEntryId || !text) {
    return Response.json(
      {
        error: 'userId, journalEntryId, and text are required to make a post',
      },
      { status: 404 },
    );
  }

  try {
    await prisma.post.create({
      data: {
        creatorId: userId as string,
        journalEntryId: journalEntryId as string,
        title: title as string,
        text: text as string,
      },
    });

    return Response.json({ message: 'created post' });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
