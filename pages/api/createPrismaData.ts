import prisma from "@/utils/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = JSON.parse(req.body);

      //not able to use createMany because the date field is not Date type
      /* const newEntries = await prisma.journalEntry.createMany({
        data: data,
        skipDuplicates: true,
      }); */
      /* const newEntry = await prisma.journalEntry.create({
        data: data,
      }); */
      const newTopic = await prisma.journalTopic.create({
        data: data,
      });
      /* const newTopic = await prisma.journalTopic.updateMany({
        where: {
          id: data.id,
        },
        data: {
          date: data.date,
        },
      }); */


      res.status(200).json(newTopic);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating prisma data" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
