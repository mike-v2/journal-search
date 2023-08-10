import { NextApiRequest, NextApiResponse } from "next";

const url = 'https://python-q4npvduerq-uw.a.run.app/chat';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msgHistory: req.body })
    });

    const data = await response.json();
    res.status(200).json({ message: data });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}