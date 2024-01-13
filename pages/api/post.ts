import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    //get all posts
    try {
      const posts = await prisma.post.findMany({
        select: {
          journalEntry: true,
          createdBy: true,
          createdAt: true,
          title: true,
          text: true,
          comments: {
            include: {
              user: true,
              post: true,
            },
          },
          id: true,
        },
      });

      res.status(200).json(posts);
    } catch (error) {
      console.error('Error getting posts:', error);
      res.status(500).json({ error: error });
    }
  } else if (req.method === 'POST') {
    //user has created post
    const { userId, journalEntryId, title, text } = JSON.parse(req.body);

    if (!userId || !journalEntryId || !text) {
      return res.status(404).json({
        error: 'UserId, JournalEntryId, and Text are required to make a post',
      });
    }

    try {
      const post = await prisma.post.create({
        data: {
          creatorId: userId as string,
          journalEntryId: journalEntryId as string,
          title: title as string,
          text: text as string,
        },
      });

      res.status(200).json({ message: 'success' });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
