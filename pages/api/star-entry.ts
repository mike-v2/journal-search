import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    const { userId, journalEntryId } = req.body;

    console.log(`user ${userId} is starring journal id ${journalEntryId}`);

    try {
      const starredEntry = await prisma.starredEntry.create({
        data: {
          userId: userId,
          journalEntryId: journalEntryId,
        },
      });

      res.status(200).json(starredEntry);
    } catch (error) {
      console.error('Error creating starred entry:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}