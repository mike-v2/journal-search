import prisma from "@/utils/prisma";
import { startOfYear } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date, year } = req.query;

  if (date) { //get journal entry on specific date
    try {
      const parsedDate = new Date(date as string);
      const entry = await prisma.journalEntry.findUnique({
        where: { date: parsedDate },
        select: {
          id: true,
          content: true,
          date: true,
          starredBy: true,
          readBy: true,
          startPage: true,
          endPage: true,
        },
      });

      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      res.status(200).json(entry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  } else if (year) { // get journal entries for specific year
    try {
      const parsedYear = parseInt(year as string);
      const startDate = new Date(Date.UTC(parsedYear, 0, 1));
      console.log('startDate = ' + startDate);
      const entries = await prisma.journalEntry.findMany({
        where: {
          date: {
            gte: startDate,
            lt: new Date(parsedYear + 1, 0, 1)
          },
        },
        select: {
          id: true,
          content: true,
          date: true,
          starredBy: true,
          readBy: true,
          startPage: true,
          endPage: true,
        },
        orderBy: {
          date: 'asc'
        }
      });

      if (!entries || entries.length === 0) {
        return res.status(404).json({ error: 'No entries found for this year' });
      }

      res.status(200).json(entries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching journal entry data' });
    }
  } else { //get all journal entries
    try {
      const entries = await prisma.journalEntry.findMany({
        select: {
          id: true,
          content: true,
          date: true,
          starredBy: true,
          readBy: true,
          startPage: true,
          endPage: true,
        },
      });

      if (!entries) {
        return res.status(404).json({ error: 'Entries not found' });
      }

      res.status(200).json(entries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching journal entry data' });
    }
  }
}