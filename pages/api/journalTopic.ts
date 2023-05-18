import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (req.query.journalEntryId) { //get topics for journal entry
      const { journalEntryId } = req.query;

      try {
        const topics = await prisma.journalTopic.findMany({
          where: {
            journalEntryId: journalEntryId as string
          },
        });

        if (!topics) {
          return res.status(404).json({ error: 'Topics not found for entry ' + journalEntryId });
        }

        res.status(200).json(topics);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching topic data' });
      }
    } else if (req.query.topicId) {  //get topic by topicId
      const { topicId } = req.query;
      try {
        const topic = await prisma.journalTopic.findUnique({
          where: {
            id: topicId as string,
          },
          select: {
            journalEntry: true,
            id: true,
            name: true,
            summary: true,
            people: true,
            places: true,
            things: true,
            organizations: true,
            emotion: true,
            strength: true,
          }
        });

        if (!topic) {
          return res.status(404).json({ error: 'Topic not found for topicId ' + topicId });
        }

        res.status(200).json(topic);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching topic data' });
      }
    } else { //get all topics
      try {
        const topics = await prisma.journalTopic.findMany({ });

        if (!topics) {
          return res.status(404).json({ error: 'Topics not found' });
        }

        res.status(200).json(topics);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching topics data' });
      }
    }
  }
}