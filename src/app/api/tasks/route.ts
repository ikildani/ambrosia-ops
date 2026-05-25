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

    const status = searchParams.get('status');
    const assigned_to = searchParams.get('assigned_to');
    const project_id = searchParams.get('project_id');
    const deal_id = searchParams.get('deal_id');
    const search = searchParams.get('search');
    const page = Math.max(1, Math.min(parseInt(searchParams.get('page') || '1', 10) || 1, 1000));
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '25', 10) || 25, 100));
    const offset = (page - 1) * limit;

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    if (deal_id) {
      query = query.eq('deal_id', deal_id);
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
    console.error('GET /api/tasks error:', err);
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

    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...body, created_by: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
