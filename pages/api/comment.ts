import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') { //get all comments on a post
    const { postId } = req.query;

    if (!postId) {
      return res.status(404).json({ error: 'PostId is required to get comments' });
    }

    try {
      const comments = await prisma.comment.findMany({
        where: {
          postId: postId as string,
        }
      });

      res.status(200).json(comments);
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({ error: error });
    }
  } else if (req.method === 'POST') { //user has created a comment
    const { userId, postId, text } = JSON.parse(req.body);

    if (!userId || !postId || !text) {
      return res.status(404).json({ error: 'UserId, PostId, and Text are required to make a comment' });
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          userId: userId as string,
          postId: postId as string,
          text: text as string,
        },
      });

      res.status(200).json({ message: "success" });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}