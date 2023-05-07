import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email as string },
      select: {
        id: true,
        // Add any additional fields you want to fetch here
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
}
