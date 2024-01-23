import path from 'path';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: 'no file specified' }, { status: 500 });

  /* const jsonDirectory = path.join(process.cwd(), 'json');
  const fileContents = await fs.readFile(
    jsonDirectory + '/1944-analysis.json',
    'utf8',
  );

  return NextResponse.json(fileContents); */
}
