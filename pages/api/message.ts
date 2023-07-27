import prisma from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { conversationId, role, content } = JSON.parse(req.body);
    console.log('trying to save message: ' + content);

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
    }
  } else if (req.method === 'DELETE') {
    const { conversationId } = req.query;

    try {
      const deleteMessages = await prisma.message.deleteMany({
        where: {
          conversationId: conversationId as string,
        },
      })

      res.status(200).json(deleteMessages);
    } catch (error) {
      console.error(error);
    }
  }
}