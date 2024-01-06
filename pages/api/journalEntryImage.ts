import { NextApiRequest, NextApiResponse } from 'next';

import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: JSON.parse(
    Buffer.from(
      process.env.GCLOUD_KEYFILE_CONTENTS_BASE64 as string,
      'base64',
    ).toString('utf-8'),
  ),
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME as string);
const options: GetSignedUrlConfig = {
  action: 'read',
  expires: Date.now() + 1000 * 60 * 60, // 1 hour
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { year, startPage, endPage } = req.query;

  if (!year || !startPage || !endPage) {
    res
      .status(400)
      .send(
        'year, startPage, and endPage are required to find journal page image',
      );
    return;
  }

  const pages = [];
  for (
    let i = parseInt(startPage as string);
    i <= parseInt(endPage as string);
    i++
  ) {
    pages.push(i);
  }

  try {
    const urls = [];

    for (const i in pages) {
      const imagePath = `${year}_pages/${year}-${pages[i]
        .toString()
        .padStart(4, '0')}.jpg`;
      const [url] = await bucket.file(imagePath).getSignedUrl(options);
      urls.push(url);
    }

    res.status(200).json(urls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
