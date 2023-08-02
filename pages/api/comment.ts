import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { Rubik_Marker_Hatch } from "next/font/google";

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
        },
        select: {
          id: true,
          userId: true,
          user: true,
          postId: true,
          post: true,
          text: true,
          createdAt: true,
        }
      });

      res.status(200).json(comments);
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({ error: error });
    }
  } else if (req.method === 'POST') { // user has created a comment
    console.log("posting in comment api");
    const { userId, postId, text, commentId } = JSON.parse(req.body);

    if (!userId || !postId || !text) {
      return res.status(404).json({ error: 'UserId, PostId, and Text are required to make a comment' });
    }

    if (commentId) { // edit comment
      try {
        const updatedComment = await prisma.comment.update({
          where: {
            id: commentId,
          },
          data: {
            text: text,
          },
          select: {
            id: true,
            userId: true,
            user: true,
            text: true,
          }
        })

        res.status(200).json(updatedComment);
      } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: error });
      }
    } else { // new comment
      try {
        const comment = await prisma.comment.create({
          data: {
            userId: userId,
            postId: postId,
            text: text,
          },
          select: {
            id: true,
            userId: true,
            user: true,
            text: true,
          }
        });

        res.status(200).json(comment);
      } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: error });
      }
    }
  } else if (req.method === 'DELETE') {
    const {commentId} = req.query;

    if (!commentId) {
      return res.status(404).json({ error: 'CommentId is required to delete a comment' });
    }

    try {
      const comment = await prisma.comment.delete({
        where: {
          id: commentId as string,
        }
      });

      res.status(200).json({ message: "success" });
    } catch(error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}