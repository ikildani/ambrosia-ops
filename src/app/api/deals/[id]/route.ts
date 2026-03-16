import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('deals')
      .select(
        '*, organizations(id, name, type), contacts(*), deal_stage_history(*)',
      )
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('GET /api/deals/[id] error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    // Check if stage is changing
    let previousStage: string | null = null;
    if (body.stage) {
      const { data: existing } = await supabase
        .from('deals')
        .select('stage')
        .eq('id', id)
        .single();

      if (existing && existing.stage !== body.stage) {
        previousStage = existing.stage;
      }
    }

    const { data, error } = await supabase
      .from('deals')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Insert stage history if stage changed
    if (previousStage !== null) {
      const { error: historyError } = await supabase
        .from('deal_stage_history')
        .insert({
          deal_id: id,
          stage: body.stage,
          previous_stage: previousStage,
          notes: body.stage_change_notes || null,
        });

      if (historyError) {
        console.error('Failed to insert stage history:', historyError.message);
      }
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('PUT /api/deals/[id] error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: { id } });
  } catch (err) {
    console.error('DELETE /api/deals/[id] error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
