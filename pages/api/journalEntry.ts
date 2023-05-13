import prisma from "@/utils/prisma";
import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import { NextApiRequest, NextApiResponse } from "next";

/* const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: JSON.parse(
    Buffer.from(process.env.GCLOUD_KEYFILE_CONTENTS_BASE64 as string, "base64").toString("utf-8")
  ),
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME as string);

async function getSignedUrl(imagePath: string) {
  const options: GetSignedUrlConfig = {
    action: "read",
    expires: Date.now() + 1000 * 60 * 60, // 1 hour
  };

  const url = await bucket.file(imagePath).getSignedUrl(options);
  return [url];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const year = req.query.year;
  //const imageName = req.query.imageName;

  if (!year) {
    res.status(400).send("Date and imageName parameters are required");
    return;
  }

  const file = bucket.file(year);
  const [fileContent] = await file.download();
  const fileContentString = fileContent.toString("utf-8");
  const jsonData = JSON.parse(fileContentString);
  
  res.status(200).json(jsonData);
}; */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date } = req.query;

  if (date) { //get journal entry on specific date
    try {
      const entry = await prisma.journalEntry.findUnique({
        where: { date: date as string },
        select: {
          id: true,
          content: true,
          date: true,
          starredBy: true,
        },
      });

      if (!entry) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(entry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: `prisma = ${prisma}` });
    }
  } else { //get all journal entries
    try {
      const entries = await prisma.journalEntry.findMany({
        select: {
          id: true,
          content: true,
          date: true,
          starredBy: true,
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