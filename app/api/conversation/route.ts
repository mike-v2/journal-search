import { NextRequest } from 'next/server';

import prisma from '@/utils/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (id) {
    // get all messages for conversation
    try {
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: id as string,
        },
        select: {
          id: true,
          messages: true,
        },
      });

      return Response.json(conversation);
    } catch (error) {
      console.error(error);
      return Response.json({ error }, { status: 500 });
    }
  } else if (userId) {
    //get all conversations for user
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          userId: userId as string,
        },
      });

      return Response.json(conversations);
    } catch (error) {
      console.error(error);
      return Response.json({ error }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  try {
    const conversation = await prisma.conversation.create({
      data: {
        user: {
          connect: {
            id: userId as string,
          },
        },
        title: 'New Conversation',
      },
      select: {
        id: true,
      },
    });

    return Response.json(conversation);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { id, title } = await req.json();

  if (!id || !title) {
    return Response.json(
      { error: 'id and title are required to patch a conversation' },
      { status: 404 },
    );
  }

  try {
    const conversation = await prisma.conversation.update({
      where: {
        id: id,
      },
      data: {
        title: title,
      },
    });

    return Response.json(conversation);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json(
      {
        error: 'Conversation ID is required to delete a conversation',
      },
      { status: 404 },
    );
  }

  try {
    const conversation = prisma.conversation.delete({
      where: {
        id: id as string,
      },
    });

    const data = (await conversation).id;
    console.log('deleted convo with id: ' + data);
    return Response.json({ message: 'successfully deleted conversation' });
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
