import { NextRequest, NextResponse } from 'next/server';
import { screenOpportunity, type OpportunityContext } from '@/lib/scoring/opportunity-screening';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OpportunityContext;

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a valid object' }, { status: 400 });
    }

    if (!body.companyName || !body.sector || !body.description) {
      return NextResponse.json({ error: 'companyName, sector, and description are required' }, { status: 400 });
    }

    const result = screenOpportunity(body);

    return NextResponse.json({
      context: {
        companyName: body.companyName,
        sector: body.sector,
        dealSize: body.dealSize,
      },
      result,
      screenedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Screening API] Error:', error);
    return NextResponse.json({ error: 'Failed to screen opportunity' }, { status: 500 });
  }
}
