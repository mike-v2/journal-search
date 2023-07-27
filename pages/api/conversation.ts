import prisma from "@/utils/prisma";
import { Message } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (req.query.userId) { //get all conversations for user
      const { userId } = req.query;

      try {
        const conversations = await prisma.conversation.findMany({
          where: {
            userId: userId as string
          },
        });

        if (!conversations) {
          return res.status(404).json({ error: 'Conversations not found for user ' + userId });
        }

        res.status(200).json(conversations);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    } else if (req.query.id) { // get all messages for conversation
      const { id } = req.query;
      console.log('getting conversation with id: ' + id);

      try {
        const conversation = await prisma.conversation.findUnique({
          where: {
            id: id as string
          },
          select: {
            id: true,
            messages: true,
          }
        });

        if (!conversation) {
          return res.status(404).json({ error: 'Messages not found for conversation ' + id });
        }

        res.status(200).json(conversation);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    }
  } else if (req.method === 'POST') {
    const { userId, messages } = JSON.parse(req.body);

    if (!userId || !messages) {
      return res.status(404).json({ error: 'UserId and messages are required to make a conversation' });
    }

    try {
      const conversation = await prisma.conversation.create({
        data: {
          user: {
            connect: {
              id: userId as string,
            }
          },
          messages: {
            create: messages.map((message: Message) => ({
              role: message.role,
              content: message.content,
            })),
          },
          title: 'New Conversation',
        },
        select: {
          id: true,
          messages: true,
        }
      });

      res.status(200).json(conversation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  } else if (req.method === 'PATCH') {
    const { id, title } = JSON.parse(req.body);

    if (!id || !title) {
      return res.status(404).json({ error: 'id and title are required to patch a conversation' });
    }

    try {
      const conversation = await prisma.conversation.update({
        where: {
          id: id,
        },
        data: {
          title: title,
        },
      })

      res.status(200).json(conversation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}