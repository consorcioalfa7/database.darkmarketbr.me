import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single known bin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bin = await db.knownBin.findUnique({
      where: { id }
    });

    if (!bin) {
      return NextResponse.json({ error: 'Known bin not found' }, { status: 404 });
    }

    return NextResponse.json(bin);
  } catch (error) {
    console.error('Error fetching known bin:', error);
    return NextResponse.json({ error: 'Failed to fetch known bin' }, { status: 500 });
  }
}

// PUT - Update known bin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, bins } = body;

    const knownBin = await db.knownBin.update({
      where: { id },
      data: {
        name,
        bins
      }
    });

    return NextResponse.json(knownBin);
  } catch (error) {
    console.error('Error updating known bin:', error);
    return NextResponse.json({ error: 'Failed to update known bin' }, { status: 500 });
  }
}

// DELETE - Delete known bin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.knownBin.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting known bin:', error);
    return NextResponse.json({ error: 'Failed to delete known bin' }, { status: 500 });
  }
}
