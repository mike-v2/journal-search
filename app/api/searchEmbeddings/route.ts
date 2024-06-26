import { NextRequest, NextResponse } from 'next/server';

const url = 'https://python-q4npvduerq-uw.a.run.app/';

export async function POST(req: NextRequest) {
  const { query, threshold } = await req.json();

  if (query === 'undefined') {
    return NextResponse.json({ error: 'no query provided' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        threshold: threshold,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
