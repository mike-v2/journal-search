import { NextResponse } from "next/server";

const url = 'https://python-q4npvduerq-uw.a.run.app/chatTitle';

export async function POST(req: Request) {
  const body = await req.json();
  console.log("making title with body: ", body);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body.text })
    });

    const data = await response.json();
    return NextResponse.json({ title: data })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}