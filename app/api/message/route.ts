import { NextRequest } from 'next/server';

import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  const { conversationId, role, content } = await req.json();

  if (!conversationId || !role || !content) {
    return Response.json(
      {
        error:
          'conversationId, role, and content are required to find journal page image',
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

    return Response.json(message);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
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

    return Response.json({ message: 'deleted messages' });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
