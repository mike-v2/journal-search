import path from 'path';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export default async function GET(req: NextRequest) {
  const jsonDirectory = path.join(process.cwd(), 'json');
  const fileContents = await fs.readFile(
    jsonDirectory + '/1944-analysis.json',
    'utf8',
  );

  return NextResponse.json(fileContents);
}
