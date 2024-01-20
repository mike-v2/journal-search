import { NextRequest } from 'next/server';

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');
  const startPage = searchParams.get('startPage');
  const endPage = searchParams.get('endPage');

  if (!year || !startPage || !endPage) {
    return Response.json(
      {
        error:
          'year, startPage, and endPage are required to find journal page image',
      },
      { status: 404 },
    );
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

    return Response.json(urls);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
