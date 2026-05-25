import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const note_type = searchParams.get('note_type');
    const organization_id = searchParams.get('organization_id');
    const search = searchParams.get('search');
    const page = Math.max(1, Math.min(parseInt(searchParams.get('page') || '1', 10) || 1, 1000));
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '25', 10) || 25, 100));
    const offset = (page - 1) * limit;

    let query = supabase
      .from('research_notes')
      .select('*', { count: 'exact' });

    if (note_type) {
      query = query.eq('note_type', note_type);
    }

    if (organization_id) {
      query = query.eq('organization_id', organization_id);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,content.ilike.%${search}%`,
      );
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
    console.error('GET /api/research error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title || !body.note_type) {
      return NextResponse.json(
        { error: 'Title and note_type are required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('research_notes')
      .insert({ ...body, author_id: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/research error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
