import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/utils/prisma';

export async function GET(req: NextRequest) {
  //get all comments on a post
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json(
      { error: 'PostId is required to get comments' },
      { status: 404 },
    );
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
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // user has created a comment
  const { id, userId, postId, text } = await req.json();

  if (!userId || !postId || !text) {
    return NextResponse.json(
      {
        error: 'UserId, PostId, and Text are required to make a comment',
      },
      { status: 404 },
    );
  }

  if (id) {
    // edit comment
    try {
      const updatedComment = await prisma.comment.update({
        where: {
          id,
        },
        data: {
          text: text,
        },
        select: {
          id: true,
          userId: true,
          user: true,
          text: true,
        },
      });

      return NextResponse.json(updatedComment);
    } catch (error) {
      console.error('Error updating comment:', error);
      return NextResponse.json({ error }, { status: 500 });
    }
  } else {
    // new comment
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
        },
      });

      return NextResponse.json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'CommentId is required to delete a comment' },
      { status: 404 },
    );
  }

  try {
    await prisma.comment.delete({
      where: {
        id: id as string,
      },
    });

    return NextResponse.json('success');
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
