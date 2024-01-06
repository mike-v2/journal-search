import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { userId, journalEntryId } = req.query;

    if (userId && journalEntryId) {
      //check if user has read entry
      try {
        const readEntry = await prisma.readEntry.findFirst({
          where: {
            userId: userId as string,
            journalEntryId: journalEntryId as string,
          },
        });

        //use 'currentIsRead' to avoid naming conflicts in receiving component
        res.status(200).json({ currentIsRead: !!readEntry });
      } catch (error) {
        console.error('Error checking if user read entry:', error);
        res.status(500).json({ error: error });
      }
    } else if (userId) {
      //get all entries read by user
      try {
        const readEntries = await prisma.readEntry.findMany({
          where: {
            userId: userId as string,
          },
          include: {
            journalEntry: true,
          },
        });

        res.status(200).json(readEntries);
      } catch (error) {
        console.error("Error finding user's read entries: ", error);
        res.status(500).json({ error: error });
      }
    }
  } else if (req.method === 'POST') {
    //user has toggled read entry
    const body = req.body;
    const { userId, journalEntryId, isRead } = JSON.parse(body);

    try {
      if (isRead) {
        const readEntry = await prisma.readEntry.delete({
          where: {
            userId_journalEntryId: {
              userId: userId as string,
              journalEntryId: journalEntryId as string,
            },
          },
        });

        //use 'currentIsRead' to avoid naming conflicts in receiving component
        res.status(200).json({ currentIsRead: false });
      } else {
        const readEntry = await prisma.readEntry.create({
          data: {
            userId: userId as string,
            journalEntryId: journalEntryId as string,
          },
        });

        res.status(200).json({ currentIsRead: !!readEntry });
      }
    } catch (error) {
      console.error('Error creating read entry:', error);
      res.status(500).json({ error: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
