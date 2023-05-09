import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method === 'GET') { //get all the topics for a journal entry
    const { journalEntryId } = req.query;

    if (!journalEntryId) {
      return res.status(400).json({ error: 'journalEntryId is required' });
    }

    try {
      const topics = await prisma.journalTopic.findMany({
        where: { 
          journalEntryId: journalEntryId as string 
        },
      });

      if (!topics) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(topics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching user data' });
    }
  }
}