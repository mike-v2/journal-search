import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  const { conversationId, role, content } = await req.json();

  if (!conversationId || !role || !content) {
    return NextResponse.json(
      {
        error:
          'conversationId, role, and content are required to post a chat message',
      },
      { status: 404 },
    );
  }

  try {
    const message = await prisma.message.create({
      data: {
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        role: role,
        content: content,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');

  try {
    await prisma.message.deleteMany({
      where: {
        conversationId: conversationId as string,
      },
    });

    return NextResponse.json({ message: 'deleted messages' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
