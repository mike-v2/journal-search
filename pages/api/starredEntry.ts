import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const {userId, journalEntryId} = req.query;

    if (userId && journalEntryId) { //check if user has starred entry
      try {
        const starredEntry = await prisma.starredEntry.findFirst({
          where: {
            userId: userId as string,
            journalEntryId: journalEntryId as string,
          },
        });

        res.status(200).json({ isStarred: !!starredEntry });
      } catch (error) {
        console.error('Error checking if user starred entry:', error);
        res.status(500).json({ error: error });
      }
    } else if (userId) { //get all entries starred by users
      try {
        const starredEntries = await prisma.starredEntry.findMany({
          where: {
            userId: userId as string,
          },
          include: {
            journalEntry: true,
          }
        });

        res.status(200).json(starredEntries);
      } catch (error) {
        console.error("Error finding user's starred entries: ", error);
        res.status(500).json({ error: error });
      }
    }
  } else if (req.method === 'POST') { //user has starred entry
    const body = req.body;
    const { userId, journalEntryId, isStarred } = JSON.parse(body);

    try {
      if (isStarred) {
        const starredEntry = await prisma.starredEntry.delete({
          where: {
            userId_journalEntryId: {
              userId: userId as string,
              journalEntryId: journalEntryId as string,
            },
          },
        });

        res.status(200).json({ isStarred: false });
      } else {
        const starredEntry = await prisma.starredEntry.create({
          data: {
            userId: userId as string,
            journalEntryId: journalEntryId as string,
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