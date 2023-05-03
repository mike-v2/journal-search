import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";
import { NextApiRequest, NextApiResponse } from "next";

const storage = new Storage({
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
};