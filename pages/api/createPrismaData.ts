import prisma from "@/utils/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const dataStr = req.body;
      const data = JSON.parse(dataStr as string);

      /* const newEntry = await prisma.journalEntry.createMany({
        data: data,
        skipDuplicates: true,
      }); */
      /* const newTopic = await prisma.journalTopic.create({
        data: data,
      }); */
      /* const newTopic = await prisma.journalTopic.updateMany({
        where: {
          id: data.id,
        },
        data: {
          date: data.date,
        },
      }); */

      //res.status(200).json(newTopic);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating prisma data" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
