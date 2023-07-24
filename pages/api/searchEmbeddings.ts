import { NextApiRequest, NextApiResponse } from "next";

const url = 'https://python-q4npvduerq-uw.a.run.app/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(req.body);
    const { query, threshold } = req.body;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        threshold: threshold,
      })
    });

    console.log("received response from openAI::");
    console.log(response);

    const data = await response.json();
    res.status(200).json({ results: data });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}