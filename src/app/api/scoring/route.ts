import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateScore } from '@/lib/scoring/engine';
import type { ScoringInput } from '@/types/scoring';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ScoringInput;

    // Basic validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid ScoringInput object' },
        { status: 400 }
      );
    }

    if (!body.relationshipStrength) {
      return NextResponse.json(
        { error: 'relationshipStrength is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.therapyAreas)) {
      return NextResponse.json(
        { error: 'therapyAreas must be an array' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.likelyServiceNeed)) {
      return NextResponse.json(
        { error: 'likelyServiceNeed must be an array' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.dealReadinessSignals)) {
      return NextResponse.json(
        { error: 'dealReadinessSignals must be an array' },
        { status: 400 }
      );
    }

    const result = calculateScore(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Scoring API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
