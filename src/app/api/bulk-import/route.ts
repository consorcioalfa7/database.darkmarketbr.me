import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface BulkImportItem {
  url: string;
  category: string;
  platform: string;
  gateway: string;
  bins?: string;
  status?: string;
}

// POST - Bulk import sites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sites } = body as { sites: BulkImportItem[] };

    if (!sites || !Array.isArray(sites) || sites.length === 0) {
      return NextResponse.json({ error: 'No sites provided' }, { status: 400 });
    }

    const createdSites = await db.site.createMany({
      data: sites.map(site => ({
        url: site.url,
        category: site.category || 'Outros',
        platform: site.platform || 'Desconhecida',
        gateway: site.gateway || 'Desconhecido',
        bins: site.bins || '',
        status: site.status || 'Ativo (Verificado)'
      }))
    });

    return NextResponse.json({ 
      success: true, 
      count: createdSites.count 
    }, { status: 201 });
  } catch (error) {
    console.error('Error bulk importing sites:', error);
    return NextResponse.json({ error: 'Failed to bulk import sites' }, { status: 500 });
  }
}
