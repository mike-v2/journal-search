import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function createJournalEntry(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { content } = req.body;

    const newEntry = await prisma.journalEntry.create({
      data: {
        content,
      },
    });

    res.status(200).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: "Error creating journal entry" });
  }
}
