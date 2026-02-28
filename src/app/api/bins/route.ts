import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all known bins
export async function GET() {
  try {
    const bins = await db.knownBin.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(bins);
  } catch (error) {
    console.error('Error fetching bins:', error);
    return NextResponse.json({ error: 'Failed to fetch bins' }, { status: 500 });
  }
}

// POST - Create new known bin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bins } = body;

    if (!name || !bins) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const knownBin = await db.knownBin.create({
      data: {
        name,
        bins
      }
    });

    return NextResponse.json(knownBin, { status: 201 });
  } catch (error) {
    console.error('Error creating known bin:', error);
    return NextResponse.json({ error: 'Failed to create known bin' }, { status: 500 });
  }
}
