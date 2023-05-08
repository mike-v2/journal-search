import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {

  const { userId, journalEntryId, isStarred } = req.query;
  const isStarredBool = isStarred === 'true';
  
  console.log(`star-entry started with user ${userId} and journal id ${journalEntryId} and isStarred = ${isStarredBool}`);

  if (req.method === 'GET') {
    try {
      const starredEntry = await prisma.starredEntry.findFirst({
        where: {
          userId: userId,
          journalEntryId: journalEntryId,
        },
      });

      res.status(200).json({ isStarred: !!starredEntry });
    } catch (error) {
      console.error('Error checking if user starred entry:', error);
      res.status(500).json({ error: error });
    }
  } else if (req.method === 'POST') {
    try {
      if (isStarredBool) {
        const starredEntry = await prisma.starredEntry.delete({
          where: {
            userId_journalEntryId: {
              userId: userId,
              journalEntryId: journalEntryId,
            },
          },
        });

        res.status(200).json({ isStarred: false });
      } else {
        const starredEntry = await prisma.starredEntry.create({
          data: {
            userId: userId,
            journalEntryId: journalEntryId,
          },
        });

        res.status(200).json({ isStarred: !!starredEntry });
      }
    } catch (error) {
      console.error('Error creating starred entry:', error);
      res.status(500).json({ error: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}