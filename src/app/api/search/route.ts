import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return NextResponse.json({
        data: { organizations: [], contacts: [], deals: [] },
      });
    }

    const searchTerm = `%${q.trim()}%`;

    const [orgsResult, contactsResult, dealsResult] = await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, type')
        .ilike('name', searchTerm)
        .limit(10),
      supabase
        .from('contacts')
        .select('id, first_name, last_name, email, title, organization_id')
        .or(
          `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`,
        )
        .limit(10),
      supabase
        .from('deals')
        .select('id, title, stage, deal_type')
        .ilike('title', searchTerm)
        .limit(10),
    ]);

    return NextResponse.json({
      data: {
        organizations: orgsResult.data ?? [],
        contacts: contactsResult.data ?? [],
        deals: dealsResult.data ?? [],
      },
    });
  } catch (err) {
    console.error('GET /api/search error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
