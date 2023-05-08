import prisma from "@/utils/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = req.body;

      //console.log("date = " + data[0].date);
      const newEntry = await prisma.journalEntry.createMany({
        data: data,
        skipDuplicates: true,
      });

      res.status(200).json(newEntry);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating journal entry" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
