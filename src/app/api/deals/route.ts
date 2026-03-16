import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const stage = searchParams.get('stage');
    const deal_type = searchParams.get('deal_type');
    const therapy_area = searchParams.get('therapy_area');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('deals')
      .select('*, organizations(id, name)', { count: 'exact' });

    if (stage) {
      query = query.eq('stage', stage);
    }

    if (deal_type) {
      query = query.eq('deal_type', deal_type);
    }

    if (therapy_area) {
      query = query.eq('therapy_area', therapy_area);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (err) {
    console.error('GET /api/deals error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    if (!body.title || !body.deal_type) {
      return NextResponse.json(
        { error: 'Title and deal_type are required' },
        { status: 400 },
      );
    }

    // Default stage to sourcing if not provided
    if (!body.stage) {
      body.stage = 'sourcing';
    }

    const { data, error } = await supabase
      .from('deals')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Insert initial stage history entry
    const { error: historyError } = await supabase
      .from('deal_stage_history')
      .insert({
        deal_id: data.id,
        stage: data.stage,
        notes: 'Deal created',
      });

    if (historyError) {
      console.error('Failed to insert stage history:', historyError.message);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/deals error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
