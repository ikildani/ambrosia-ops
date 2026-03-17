import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeOpportunity, type OpportunityContext } from '@/lib/ai/opportunity-analyzer';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Screening is available to all roles
    // Fee details in the result are visible to all (read-only)
    // Fee management (create/edit/delete) is partner/admin only (handled by RLS)

    const rateLimit = checkRateLimit(user.id, 'screening');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before screening another opportunity.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) } }
      );
    }

    const body = (await request.json()) as OpportunityContext;

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a valid object' }, { status: 400 });
    }

    if (!body.companyName || !body.sector || !body.description) {
      return NextResponse.json({ error: 'companyName, sector, and description are required' }, { status: 400 });
    }

    const fullResult = await analyzeOpportunity(body);

    // Strip internal metadata — Perplexity, CRM context, and validation internals
    // are silent intelligence layers, never exposed to the client
    const { meta, ...clientResult } = fullResult;

    return NextResponse.json({
      context: {
        companyName: body.companyName,
        sector: body.sector,
        dealSize: body.dealSize,
      },
      result: clientResult,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Screening API] Error:', error);
    return NextResponse.json({ error: 'Failed to analyze opportunity' }, { status: 500 });
  }
}
