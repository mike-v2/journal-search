import prisma from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* if (req.method === 'GET') {
    if (req.query.conversationId) { //get all messages for conversation
      const { conversationId } = req.query;

      try {
        const messages = await prisma.message.findMany({
          where: {
            conversationId: conversationId as string
          },
        });

        if (!messages) {
          return res.status(404).json({ error: 'Messages not found for conversation ' + conversationId });
        }

        res.status(200).json(messages);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    }
  } */
  if (req.method === 'POST') {
    const { conversationId, role, content } = JSON.parse(req.body);

    if (!conversationId || !role || !content) {
      return res.status(404).json({ error: 'ConversationId, role, and content are required to make a conversation' });
    }

    try {
      const message = await prisma.message.create({
        data: {
          conversation: {
            connect: {
              id: conversationId,
            }
          },
          role: role,
          content: content,
        }
      });
      res.status(200).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }
}