// pages/api/chat.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge'
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  /* fetch: globalThis.fetch, */
});

const responseModel = 'gpt-3.5-turbo';
const responseModelTemperature = .2;
const responseModelContextLength = 4000;

export async function POST() {
  console.log("starting test...");

  /* const encoder = new TextEncoder();

  // Create a readable stream for the response
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Send a test event
  const testMessage = encoder.encode(`data: {"test": "This is a test message"}\n\n`);
  writer.write(testMessage);

  // After some time, send another message and close the connection
  setTimeout(() => {
    const closingMessage = encoder.encode(`data: {"test": "Closing connection"}\n\n`);
    writer.write(closingMessage);
    writer.close();
  }, 5000);

  return new NextResponse(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  }); */

  /* const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter(); */

  try {
    const stream = await openai.chat.completions.create({
      model: responseModel,
      messages: [{ "role": "user", "content": "what is your favorite color?" }],
      temperature: responseModelTemperature,
      stream: true,
    });
    console.log("openai finished. response: ", stream);

    const streamingResponse = OpenAIStream(stream);
    return new StreamingTextResponse(streamingResponse);

    // @ts-ignore
    /* stream.data.on('data', async (data: Buffer) => {
      const lines = data
        .toString()
        .split('\n')
        .filter((line: string) => line.trim() !== '');
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          console.log('Stream completed');
          writer.close();
          return;
        }
        try {
          const parsed = JSON.parse(message);
          console.log("received chunk: ", parsed.choices[0]);
          await writer.write(encoder.encode(`${parsed.choices[0].text}`));
        } catch (error) {
          console.error('Could not JSON parse stream message', message, error);
        }
      }
    }); */
  } catch (error) {
    console.error('An error occurred during OpenAI request', error);
    /* writer.write(encoder.encode('An error occurred during OpenAI request'));
    writer.close(); */
  }

  /* console.log("returning response: ", readable)

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  }); */
}
