import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface BulkImportBinItem {
  name: string;
  bins: string;
}

// POST - Bulk import BINs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bins } = body as { bins: BulkImportBinItem[] };

    if (!bins || !Array.isArray(bins) || bins.length === 0) {
      return NextResponse.json({ error: 'No BINs provided' }, { status: 400 });
    }

    const createdBins = await db.knownBin.createMany({
      data: bins.map(bin => ({
        name: bin.name,
        bins: bin.bins
      })),
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      count: createdBins.count
    }, { status: 201 });
  } catch (error) {
    console.error('Error bulk importing BINs:', error);
    return NextResponse.json({ error: 'Failed to bulk import BINs' }, { status: 500 });
  }
}
