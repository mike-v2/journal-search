import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@elastic/elasticsearch';
import { Storage } from "@google-cloud/storage";

const client = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID as string,
  },
  auth: {
    username: process.env.ELASTIC_USERNAME as string,
    password: process.env.ELASTIC_PASSWORD as string
  },
});

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: JSON.parse(
    Buffer.from(process.env.GCLOUD_KEYFILE_CONTENTS_BASE64 as string, "base64").toString("utf-8")
  ),
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const file = bucket.file('1948-analysis.json');
    const [fileContent] = await file.download();
    const fileContentString = fileContent.toString("utf-8");
    const jsonData = JSON.parse(fileContentString);

    console.log("downloaded and parsed data. preparing to ingest.")

    for (const entry of jsonData) {
      await client.index({
        index: 'entries',
        document: entry,
        pipeline: 'entries_metadata_pipeline',
      })
    }

    console.log("data has been indexed")
  } catch (err) {
    console.log(err)
  }
}