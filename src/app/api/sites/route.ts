import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all sites
export async function GET() {
  try {
    const sites = await db.site.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
  }
}

// POST - Create new site
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, category, platform, gateway, bins, status } = body;

    if (!url || !category || !platform || !gateway) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const site = await db.site.create({
      data: {
        url,
        category,
        platform,
        gateway,
        bins: bins || '',
        status: status || 'Ativo (Verificado)'
      }
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
  }
}
